import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const projectId = process.env.GOOGLE_PROJECT_ID || 'philosoph-ai-478709';
const bigquery = new BigQuery({ projectId });

async function checkData() {
  console.log('🔍 Checking BigQuery data...\n');
  
  // Check if dataset exists
  const dataset = bigquery.dataset('philosophy_data');
  const [datasetExists] = await dataset.exists();
  
  if (!datasetExists) {
    console.log('❌ Dataset "philosophy_data" does not exist');
    return;
  }
  console.log('✅ Dataset exists');
  
  // Check if table exists
  const table = dataset.table('philosophy_documents');
  const [tableExists] = await table.exists();
  
  if (!tableExists) {
    console.log('❌ Table "philosophy_documents" does not exist');
    return;
  }
  console.log('✅ Table exists');
  
  // Count total rows
  const countQuery = `
    SELECT COUNT(*) as total
    FROM \`${projectId}.philosophy_data.philosophy_documents\`
  `;
  
  const [countResult] = await bigquery.query({ query: countQuery });
  const total = countResult[0].total;
  console.log(`\n📊 Total documents: ${total}`);
  
  if (total === 0) {
    console.log('\n⚠️  No documents found in the table');
    return;
  }
  
  // Get sample data
  const sampleQuery = `
    SELECT 
      id,
      LEFT(content, 100) as content_preview,
      ARRAY_LENGTH(embedding) as embedding_length,
      metadata,
      created_at
    FROM \`${projectId}.philosophy_data.philosophy_documents\`
    LIMIT 5
  `;
  
  const [samples] = await bigquery.query({ query: sampleQuery });
  
  console.log('\n📝 Sample documents:');
  samples.forEach((row, idx) => {
    console.log(`\n${idx + 1}. ID: ${row.id}`);
    console.log(`   Content: ${row.content_preview}...`);
    console.log(`   Embedding dimensions: ${row.embedding_length}`);
    console.log(`   Metadata: ${JSON.stringify(row.metadata)}`);
    console.log(`   Created: ${row.created_at}`);
  });
  
  // Get statistics by book
  const statsQuery = `
    SELECT 
      JSON_VALUE(metadata, '$.source') as source,
      COUNT(*) as chunk_count
    FROM \`${projectId}.philosophy_data.philosophy_documents\`
    GROUP BY source
    ORDER BY chunk_count DESC
  `;
  
  const [stats] = await bigquery.query({ query: statsQuery });
  
  if (stats.length > 0) {
    console.log('\n📚 Documents by book:');
    stats.forEach(row => {
      console.log(`   ${row.source}: ${row.chunk_count} chunks`);
    });
  }
}

checkData().catch(console.error);
