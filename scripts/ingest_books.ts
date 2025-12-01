import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/vertexClient';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BOOKS_DIR = path.join(process.cwd(), 'philosophy_data', 'books');
const CHUNK_SIZE = 1000; // Characters per chunk
const CHUNK_OVERLAP = 100; // Overlap between chunks

// Helper to clean Gutenberg headers
function cleanText(text: string): string {
  // Simple heuristic: Gutenberg books usually have a header and footer
  // We'll look for "START OF THE PROJECT GUTENBERG EBOOK" and "END OF THE PROJECT GUTENBERG EBOOK"
  
  const startMarker = text.match(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*? \*\*\*/);
  const endMarker = text.match(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*? \*\*\*/);

  let startIndex = 0;
  let endIndex = text.length;

  if (startMarker && startMarker.index !== undefined) {
    startIndex = startMarker.index + startMarker[0].length;
  }

  if (endMarker && endMarker.index !== undefined) {
    endIndex = endMarker.index;
  }

  return text.substring(startIndex, endIndex).trim();
}

// Helper to split text into chunks
function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    let chunk = text.substring(start, end);
    
    // Try to break at a newline or period if possible to avoid cutting words
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > size * 0.5) { // Only if the break point is reasonably far in
        chunk = chunk.substring(0, breakPoint + 1);
        start += breakPoint + 1 - overlap;
      } else {
        start += size - overlap;
      }
    } else {
      start += size - overlap;
    }

    chunks.push(chunk.trim());
  }

  return chunks;
}

async function processBook(filename: string) {
  console.log(`📖 Processing ${filename}...`);
  
  const filePath = path.join(BOOKS_DIR, filename);
  const rawText = fs.readFileSync(filePath, 'utf-8');
  const text = cleanText(rawText);

  // Extract metadata from filename (format: author_title_id.txt)
  const parts = filename.replace('.txt', '').split('_');
  const bookId = parts.pop(); // Last part is ID
  // Reconstruct title and author (this is a bit rough, but works for our format)
  // We know the format is author_title_id, but author/title might have underscores
  // We can just store the filename as metadata for now
  
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
  console.log(`   Generated ${chunks.length} chunks.`);

  // Process in batches to avoid hitting API limits
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    
    try {
      const embeddings = await Promise.all(
        batch.map(async (chunk) => {
          const vector = await generateEmbedding(chunk);
          return {
            content: chunk,
            embedding: vector,
            metadata: {
              source: filename,
              book_id: bookId,
              chunk_index: i + batch.indexOf(chunk)
            }
          };
        })
      );

      // Filter out failed embeddings
      const validRecords = embeddings.filter(r => r.embedding.length > 0);

      if (validRecords.length > 0) {
        const { error } = await supabase.from('documents').insert(validRecords);
        if (error) throw error;
      }
      
      process.stdout.write('.'); // Progress indicator
    } catch (err) {
      console.error(`\n   ❌ Error processing batch ${i}:`, err);
    }
    
    // Rate limiting pause
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  console.log('\n   ✅ Done.');
}

async function main() {
  const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
  console.log(`Found ${files.length} books to ingest.`);

  for (const file of files) {
    await processBook(file);
  }
}

main();
