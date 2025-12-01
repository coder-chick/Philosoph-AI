import fs from 'fs';
import path from 'path';
import { generateEmbedding } from '../lib/vertexClient';
import { initializeBigQuery, insertDocuments, PhilosophyDocument } from '../lib/bigqueryClient';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BOOKS_DIR = path.join(process.cwd(), 'philosophy_data', 'books');
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;
const BATCH_SIZE = 50; // Insert in batches to avoid rate limits

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

  return chunks.filter(c => c.length > 0);
}

async function processBook(filePath: string, fileName: string): Promise<PhilosophyDocument[]> {
  console.log(`\n📖 Processing: ${fileName}`);
  
  const rawText = fs.readFileSync(filePath, 'utf-8');
  const text = cleanText(rawText);
  const chunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
  
  console.log(`   Generated ${chunks.length} chunks`);
  
  const parts = fileName.replace('.txt', '').split('_');
  const bookId = parts.pop();
  const title = parts.join(' ');
  
  const documents: PhilosophyDocument[] = [];
  
  // Process ONE AT A TIME to respect rate limits
  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await generateEmbedding(chunks[i]);
      
      documents.push({
        content: chunks[i],
        embedding: embedding,
        metadata: {
          source: fileName,
          book_id: bookId,
          title: title,
          chunk_index: i,
          total_chunks: chunks.length,
        },
      });
      
      if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
        console.log(`   Processed ${i + 1}/${chunks.length} chunks`);
      }
      
      // Small delay between chunks to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`   ❌ Failed to process chunk ${i}:`, error);
      // Continue with next chunk instead of failing entire book
    }
  }
  
  return documents;
}

async function main() {
  console.log('🚀 Starting BigQuery Philosophy Books Ingestion (TEST MODE)\n');
  
  // Initialize BigQuery
  console.log('📊 Initializing BigQuery...');
  await initializeBigQuery();
  
  // Get all book files
  if (!fs.existsSync(BOOKS_DIR)) {
    console.error(`❌ Books directory not found: ${BOOKS_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
  console.log(`\n📚 Found ${files.length} books. Testing with FIRST BOOK ONLY (20 chunks max)\n`);
  
  // TEST MODE: Process only first book with limited chunks
  const file = files[0];
  
  try {
    const filePath = path.join(BOOKS_DIR, file);
    console.log(`\n📖 Processing: ${file}`);
    
    const rawText = fs.readFileSync(filePath, 'utf-8');
    const text = cleanText(rawText);
    const allChunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
    
    // LIMIT TO 20 CHUNKS FOR TESTING
    const chunks = allChunks.slice(0, 20);
    console.log(`   Generated ${chunks.length} chunks (limited for testing, total available: ${allChunks.length})`);
    
    const parts = file.replace('.txt', '').split('_');
    const bookId = parts.pop();
    const title = parts.join(' ');
    
    const documents: PhilosophyDocument[] = [];
    
    // Process ONE AT A TIME to respect rate limits
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await generateEmbedding(chunks[i]);
        
        documents.push({
          content: chunks[i],
          embedding: embedding,
          metadata: {
            source: file,
            book_id: bookId,
            title: title,
            chunk_index: i,
            total_chunks: chunks.length,
          },
        });
        
        console.log(`   ✓ Processed chunk ${i + 1}/${chunks.length}`);
        
        // Delay between chunks to avoid rate limits (1 request per second)
        await new Promise(resolve => setTimeout(resolve, 1200));
        
      } catch (error: any) {
        console.error(`   ❌ Failed to process chunk ${i}: ${error.message}`);
        // Continue with next chunk instead of failing entire book
      }
    }
    
    console.log(`\n   💾 Inserting ${documents.length} documents to BigQuery...`);
    
    // Insert in batches with error handling
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, Math.min(i + BATCH_SIZE, documents.length));
      try {
        await insertDocuments(batch);
        console.log(`   ✅ Inserted batch: ${i + 1}-${Math.min(i + BATCH_SIZE, documents.length)}/${documents.length} chunks`);
      } catch (error: any) {
        console.error(`   ❌ Failed to insert batch ${i}-${i + BATCH_SIZE}: ${error.message}`);
        // Continue with next batch
      }
    }
    
    console.log(`\n✅ Test Complete! Processed: ${file}`);
    console.log(`   Total chunks inserted: ${documents.length}`);
    console.log(`\n🔍 Run "npx tsx scripts/check_bigquery.ts" to verify data was stored`);
    
  } catch (error: any) {
    console.error(`❌ Error processing ${file}: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
