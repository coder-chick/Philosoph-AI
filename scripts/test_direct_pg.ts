import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { generateEmbedding } from '../lib/vertexClient';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BOOKS_DIR = path.join(process.cwd(), 'philosophy_data', 'books');
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

// Postgres direct connection (not pooler) - use exact format from Supabase
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const connectionString = `postgresql://postgres:[YOUR_PASSWORD]@db.jtgrfaaqqnhluidmqxjr.supabase.co:5432/postgres`.replace('[YOUR_PASSWORD]', DB_PASSWORD || '');

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

  return chunks;
}

async function testDirectPg() {
  console.log('🧪 Starting DIRECT PG ingestion test...');

  if (!DB_PASSWORD) {
    console.error('❌ Missing SUPABASE_DB_PASSWORD in .env.local');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to Postgres...');
    await client.connect();
    console.log('✅ Connected!');

    // Test table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'documents'
      );
    `);
    console.log('📊 Table exists:', tableCheck.rows[0].exists);

    // Pick test file
    const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
    const testFile = files[0];
    console.log(`📖 Selected: ${testFile}`);

    const filePath = path.join(BOOKS_DIR, testFile);
    const rawText = fs.readFileSync(filePath, 'utf-8');
    const text = cleanText(rawText);
    
    const allChunks = chunkText(text, CHUNK_SIZE, CHUNK_OVERLAP);
    const testChunks = allChunks.slice(0, 3); // Just 3 chunks for speed
    console.log(`   Testing with ${testChunks.length} chunks.`);

    const parts = testFile.replace('.txt', '').split('_');
    const bookId = parts.pop();

    console.log('   ⚡ Generating embeddings...');
    for (let i = 0; i < testChunks.length; i++) {
      const chunk = testChunks[i];
      const embedding = await generateEmbedding(chunk);
      console.log(`      - Chunk ${i}: Embedding generated (length: ${embedding.length})`);

      if (embedding.length > 0) {
        const metadata = {
          source: testFile,
          book_id: bookId,
          chunk_index: i,
          is_test: true
        };

        const embeddingStr = `[${embedding.join(',')}]`;
        
        const result = await client.query(
          `INSERT INTO public.documents (content, embedding, metadata) 
           VALUES ($1, $2::vector, $3::jsonb) 
           RETURNING id`,
          [chunk, embeddingStr, JSON.stringify(metadata)]
        );

        console.log(`      ✅ Inserted with ID: ${result.rows[0].id}`);
      }
    }

    console.log('✅ TEST SUCCESSFUL! All chunks inserted.');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from Postgres.');
  }
}

testDirectPg();
