import { BigQuery } from '@google-cloud/bigquery';

const projectId = process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'philosoph-ai-478709';
const datasetId = 'philosophy_data';
const tableId = 'philosophy_documents';

const bigquery = new BigQuery({
  projectId,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export interface PhilosophyDocument {
  content: string;
  embedding: number[];
  metadata: {
    source?: string;
    book_id?: string;
    chunk_index?: number;
    author?: string;
    title?: string;
    [key: string]: any;
  };
}

/**
 * Initialize BigQuery dataset and table if they don't exist
 */
export async function initializeBigQuery() {
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

    // Create table if it doesn't exist
    const table = dataset.table(tableId);
    const [tableExists] = await table.exists();
    
    if (!tableExists) {
      console.log(`Creating table: ${tableId}`);
      const schema = [
        { name: 'id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'content', type: 'STRING', mode: 'REQUIRED' },
        { name: 'embedding', type: 'FLOAT64', mode: 'REPEATED' }, // Array for vector
        { name: 'metadata', type: 'JSON', mode: 'NULLABLE' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
      ];

      await dataset.createTable(tableId, { schema });
      console.log('✓ Table created');
    }

    console.log('✅ BigQuery initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing BigQuery:', error);
    throw error;
  }
}

/**
 * Insert a single document into BigQuery
 */
export async function insertDocument(doc: PhilosophyDocument): Promise<string> {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);

  const id = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const row = {
    id,
    content: doc.content,
    embedding: doc.embedding,
    metadata: doc.metadata,
    created_at: new Date().toISOString(),
  };

  await table.insert([row]);
  return id;
}

/**
 * Insert multiple documents in batch
 */
export async function insertDocuments(docs: PhilosophyDocument[]): Promise<void> {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);

  const rows = docs.map(doc => ({
    id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
    content: doc.content,
    embedding: doc.embedding,
    metadata: doc.metadata,
    created_at: new Date().toISOString(),
  }));

  await table.insert(rows);
}

/**
 * Query documents with vector similarity search
 */
export async function searchSimilarDocuments(
  queryEmbedding: number[],
  limit: number = 10
): Promise<any[]> {
  // Convert embedding to string for SQL
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  const query = `
    WITH query_embedding AS (
      SELECT ${embeddingStr} as query_vec
    )
    SELECT 
      id,
      content,
      metadata,
      created_at,
      -- Cosine similarity calculation
      (
        SELECT SUM(a * b) / (
          SQRT(SUM(a * a)) * SQRT(SUM(b * b))
        )
        FROM UNNEST(embedding) a WITH OFFSET pos
        JOIN UNNEST((SELECT query_vec FROM query_embedding)) b WITH OFFSET pos2
        ON pos = pos2
      ) as similarity
    FROM \`${projectId}.${datasetId}.${tableId}\`
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  const [rows] = await bigquery.query({ query });
  return rows;
}

/**
 * Get statistics about the stored documents
 */
export async function getStats(): Promise<{
  totalDocuments: number;
  totalChunks: number;
  uniqueBooks: number;
}> {
  const query = `
    SELECT 
      COUNT(*) as total_documents,
      COUNT(*) as total_chunks,
      COUNT(DISTINCT JSON_VALUE(metadata, '$.book_id')) as unique_books
    FROM \`${projectId}.${datasetId}.${tableId}\`
  `;

  const [rows] = await bigquery.query({ query });
  return {
    totalDocuments: parseInt(rows[0].total_documents),
    totalChunks: parseInt(rows[0].total_chunks),
    uniqueBooks: parseInt(rows[0].unique_books),
  };
}
