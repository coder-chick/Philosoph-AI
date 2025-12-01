import fs from 'fs';
import path from 'path';
import { initializeBooksTable, insertBook, Book } from '../lib/bigqueryBooksClient';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BOOKS_DIR = path.join(process.cwd(), 'philosophy_data', 'books');
const BATCH_SIZE = 10; // Upload 10 books at a time

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

function extractMetadataFromFilename(filename: string): { title: string; author?: string; gutenberg_id?: string } {
  // Example filename: "adam_smith_an_inquiry_into_the_nature_and_causes_of_the_wealth_of_nations_3300.txt"
  const parts = filename.replace('.txt', '').split('_');
  
  // Last part is usually the Gutenberg ID (if it's a number)
  const lastPart = parts[parts.length - 1];
  const gutenberg_id = /^\d+$/.test(lastPart) ? lastPart : undefined;
  
  if (gutenberg_id) {
    parts.pop(); // Remove ID from parts
  }
  
  // Try to extract author (usually first 1-2 parts)
  let author = undefined;
  let titleStartIndex = 0;
  
  // Simple heuristic: if first 2 parts look like a name, treat as author
  if (parts.length > 2 && parts[0].length < 15 && parts[1].length < 15) {
    author = `${parts[0]} ${parts[1]}`.replace(/_/g, ' ');
    titleStartIndex = 2;
  }
  
  const title = parts.slice(titleStartIndex).join(' ').replace(/_/g, ' ');
  
  return { title, author, gutenberg_id };
}

async function main() {
  console.log('🚀 Starting Book Upload to BigQuery (Chunked)\n');
  
  // Initialize BigQuery
  console.log('📊 Initializing BigQuery books table...');
  await initializeBooksTable();
  
  // Get all book files
  if (!fs.existsSync(BOOKS_DIR)) {
    console.error(`❌ Books directory not found: ${BOOKS_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.txt'));
  console.log(`\n📚 Found ${files.length} books. Testing with FIRST 5 BOOKS ONLY\n`);
  console.log(`⚠️  Note: Books will be split into ~1MB chunks to avoid BigQuery 10MB row limit\n`);
  
  // TEST MODE: Only upload first 5 books
  const testFiles = files.slice(0, 5);
  
  let uploadedBooks = 0;
  let failedBooks = 0;
  
  // Process each book individually (not in batches due to size)
  for (const file of testFiles) {
    try {
      const filePath = path.join(BOOKS_DIR, file);
      const rawText = fs.readFileSync(filePath, 'utf-8');
      const cleanedText = cleanText(rawText);
      
      const { title, author, gutenberg_id } = extractMetadataFromFilename(file);
      const book_id = file.replace('.txt', '');
      
      // Split large books into chunks to avoid BigQuery 10MB row limit
      const MAX_CHUNK_SIZE = 1000000; // 1MB of text per chunk
      const textChunks: string[] = [];
      
      if (cleanedText.length > MAX_CHUNK_SIZE) {
        console.log(`   📖 ${title} ${author ? `by ${author}` : ''} (${Math.ceil(cleanedText.length / MAX_CHUNK_SIZE)} parts due to size)`);
        
        for (let i = 0; i < cleanedText.length; i += MAX_CHUNK_SIZE) {
          textChunks.push(cleanedText.substring(i, Math.min(i + MAX_CHUNK_SIZE, cleanedText.length)));
        }
      } else {
        console.log(`   📖 ${title} ${author ? `by ${author}` : ''}`);
        textChunks.push(cleanedText);
      }
      
      // Upload each chunk as a separate row
      for (let chunkIndex = 0; chunkIndex < textChunks.length; chunkIndex++) {
        const book: Book = {
          book_id: textChunks.length > 1 ? `${book_id}_part${chunkIndex + 1}` : book_id,
          title: textChunks.length > 1 ? `${title} (Part ${chunkIndex + 1}/${textChunks.length})` : title,
          author,
          gutenberg_id,
          full_text: textChunks[chunkIndex],
          metadata: {
            source: 'Project Gutenberg',
            filename: file,
            text_length: textChunks[chunkIndex].length,
            is_part: textChunks.length > 1,
            part_number: chunkIndex + 1,
            total_parts: textChunks.length,
            original_book_id: book_id,
          },
        };
        
        await insertBook(book);
      }
      
      uploadedBooks++;
      console.log(`   ✅ Uploaded: ${title} (${textChunks.length} chunk${textChunks.length > 1 ? 's' : ''})\n`);
      
    } catch (error: any) {
      console.error(`   ❌ Failed to upload ${file}: ${error.message}`);
      if (error.errors) {
        console.error(`   Error details:`, JSON.stringify(error.errors, null, 2));
      }
      failedBooks++;
    }
  }
  
  console.log('\n✅ Test Upload Complete!');
  console.log(`   Books uploaded: ${uploadedBooks}/${testFiles.length}`);
  console.log(`   Failed: ${failedBooks}`);
  console.log(`\n🔍 Run "npx tsx scripts/check_bigquery.ts" to verify books were stored`);
  console.log(`📊 Next step: Run chunk and embedding script to process the books`);
}

main().catch(console.error);
