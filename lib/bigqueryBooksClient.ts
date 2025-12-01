import { BigQuery } from '@google-cloud/bigquery';

const projectId = process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'philosoph-ai-478709';
const datasetId = 'philosophy_data';
const booksTableId = 'books';

const bigquery = new BigQuery({
  projectId,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export interface Book {
  book_id: string;
  title: string;
  author?: string;
  gutenberg_id?: string;
  full_text: string;
  metadata?: {
    source?: string;
    language?: string;
    subjects?: string[];
    [key: string]: any;
  };
}

/**
 * Initialize BigQuery dataset and books table if they don't exist
 */
export async function initializeBooksTable() {
  try {
    // Create dataset if it doesn't exist
    const dataset = bigquery.dataset(datasetId);
    const [datasetExists] = await dataset.exists();
    
    if (!datasetExists) {
      console.log(`Creating dataset: ${datasetId}`);
      await bigquery.createDataset(datasetId, {
        location: 'US',
      });
      console.log('✓ Dataset created');
    }

    // Create books table if it doesn't exist
    const table = dataset.table(booksTableId);
    const [tableExists] = await table.exists();
    
    if (!tableExists) {
      console.log(`Creating table: ${booksTableId}`);
      const schema = [
        { name: 'book_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'title', type: 'STRING', mode: 'REQUIRED' },
        { name: 'author', type: 'STRING', mode: 'NULLABLE' },
        { name: 'gutenberg_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'full_text', type: 'STRING', mode: 'REQUIRED' },
        { name: 'metadata', type: 'JSON', mode: 'NULLABLE' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'processed', type: 'BOOLEAN', mode: 'NULLABLE' },
      ];

      await dataset.createTable(booksTableId, { schema });
      console.log('✓ Books table created');
    }

    console.log('✅ BigQuery books table initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing books table:', error);
    throw error;
  }
}

/**
 * Insert a single book into BigQuery
 */
export async function insertBook(book: Book): Promise<void> {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(booksTableId);

  const row = {
    book_id: book.book_id,
    title: book.title,
    author: book.author || null,
    gutenberg_id: book.gutenberg_id || null,
    full_text: book.full_text,
    metadata: book.metadata || {},
    created_at: new Date().toISOString(),
    processed: false,
  };

  await table.insert([row]);
}

/**
 * Insert multiple books in batch
 */
export async function insertBooks(books: Book[]): Promise<void> {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(booksTableId);

  const rows = books.map(book => ({
    book_id: book.book_id,
    title: book.title,
    author: book.author || null,
    gutenberg_id: book.gutenberg_id || null,
    full_text: book.full_text,
    metadata: book.metadata || {},
    created_at: new Date().toISOString(),
    processed: false,
  }));

  await table.insert(rows);
}

/**
 * Get all unprocessed books
 */
export async function getUnprocessedBooks(): Promise<any[]> {
  const query = `
    SELECT 
      book_id,
      title,
      author,
      gutenberg_id,
      full_text,
      metadata
    FROM \`${projectId}.${datasetId}.${booksTableId}\`
    WHERE processed = false OR processed IS NULL
    ORDER BY created_at ASC
  `;

  const [rows] = await bigquery.query({ query });
  return rows;
}

/**
 * Mark a book as processed
 */
export async function markBookAsProcessed(bookId: string): Promise<void> {
  const query = `
    UPDATE \`${projectId}.${datasetId}.${booksTableId}\`
    SET processed = true
    WHERE book_id = @bookId
  `;

  await bigquery.query({
    query,
    params: { bookId },
  });
}

/**
 * Get statistics about stored books
 */
export async function getBooksStats(): Promise<{
  totalBooks: number;
  processedBooks: number;
  unprocessedBooks: number;
}> {
  const query = `
    SELECT 
      COUNT(*) as total_books,
      COUNTIF(processed = true) as processed_books,
      COUNTIF(processed = false OR processed IS NULL) as unprocessed_books
    FROM \`${projectId}.${datasetId}.${booksTableId}\`
  `;

  const [rows] = await bigquery.query({ query });
  return {
    totalBooks: parseInt(rows[0].total_books),
    processedBooks: parseInt(rows[0].processed_books),
    unprocessedBooks: parseInt(rows[0].unprocessed_books),
  };
}
