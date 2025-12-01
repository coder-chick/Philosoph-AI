import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/vertexClient';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log(`Using Supabase URL: ${SUPABASE_URL}`);
console.log(`Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BOOKS_DIR = path.join(process.cwd(), 'philosophy_data', 'books');
const CHUNK_SIZE = 1000; // Characters per chunk
const CHUNK_OVERLAP = 100; // Overlap between chunks

// Helper to clean Gutenberg headers
function cleanText(text: string): string {
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
    
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > size * 0.5) {
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

async function testIngest() {
  console.log('🧪 Starting TEST ingestion of a single book...');

  // 1. Pick one file
  if (!fs.existsSync(BOOKS_DIR)) {
      console.error(`❌ Books directory not found: ${BOOKS_DIR}`);
      return;
  }
  
  const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
  if (files.length === 0) {
      console.error('❌ No books found to test with.');
      return;
  }

  const testFile = files[0]; // Just pick the first one
  console.log(`📖 Selected test file: ${testFile}`);

  const filePath = path.join(BOOKS_DIR, testFile);
  const rawText = fs.readFileSync(filePath, 'utf-8');
  const text = cleanText(rawText);
  
  console.log(`   Text length after cleaning: ${text.length} chars`);

  // 2. Chunk it (limit to first 5 chunks for testing)
  const allChunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
  const testChunks = allChunks.slice(0, 5);
  console.log(`   Generated ${allChunks.length} chunks. Testing with first ${testChunks.length} chunks.`);

  // 3. Generate Embeddings & Insert
  const parts = testFile.replace('.txt', '').split('_');
  const bookId = parts.pop();

  try {
      console.log('   ⚡ Generating embeddings...');
      const embeddings = await Promise.all(
        testChunks.map(async (chunk, index) => {
          const vector = await generateEmbedding(chunk);
          console.log(`      - Chunk ${index}: Embedding generated (length: ${vector.length})`);
          return {
            content: chunk,
            embedding: vector,
            metadata: {
              source: testFile,
              book_id: bookId,
              chunk_index: index,
              is_test: true
            }
          };
        })
      );

      const validRecords = embeddings.filter(r => r.embedding.length > 0);
      console.log(`   ✅ Generated ${validRecords.length} valid embeddings.`);

      if (validRecords.length > 0) {
        console.log('   💾 Inserting into Supabase philosophy_documents table...');
        
        for (let i = 0; i < validRecords.length; i++) {
          const record = validRecords[i];
          try {
            const { data, error } = await supabase
              .from('philosophy_documents')
              .insert({
                content: record.content,
                embedding: record.embedding,
                metadata: record.metadata
              })
              .select();
            
            if (error) {
              console.error(`   ❌ Insert Error for chunk ${i}:`, error);
            } else {
              console.log(`   ✅ Chunk ${i} inserted successfully!`);
            }
          } catch (err) {
            console.error(`   ❌ Unexpected error for chunk ${i}:`, err);
          }
        }
        console.log('   ✅ All inserts attempted!');
      } else {
          console.error('   ❌ No valid embeddings to insert.');
      }

  } catch (err) {
      console.error('   ❌ Unexpected error during test:', err);
  }
}

testIngest();
