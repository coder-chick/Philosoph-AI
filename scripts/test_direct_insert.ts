import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/vertexClient';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
  console.log('🧪 Testing direct insert with embedding...');
  
  // Generate a test embedding
  const testText = 'Philosophy is the study of general and fundamental questions about existence, knowledge, values, reason, mind, and language.';
  console.log('⚡ Generating embedding...');
  const embedding = await generateEmbedding(testText);
  console.log(`✅ Embedding generated (length: ${embedding.length})`);
  
  // Create the table if it doesn't exist
  console.log('📋 Ensuring table exists...');
  const { error: createError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS philosophy_documents (
        id BIGSERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        embedding vector(768),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS philosophy_documents_embedding_idx 
      ON philosophy_documents USING ivfflat (embedding vector_cosine_ops);
    `
  });
  
  if (createError) {
    console.log('Note: exec_sql not available, table should already exist');
  }
  
  // Try direct SQL insert
  console.log('💾 Attempting insert via raw SQL...');
  const embeddingStr = `[${embedding.join(',').substring(0, 100)}...]`; // Truncate for display
  console.log(`   Embedding preview: ${embeddingStr}`);
  
  try {
    // Use the Supabase REST API directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY!,
        'Authorization': `Bearer ${SUPABASE_KEY!}`
      } as HeadersInit,
      body: JSON.stringify({
        query: `
          INSERT INTO philosophy_documents (content, embedding, metadata)
          VALUES ($1, $2::vector, $3::jsonb)
          RETURNING id;
        `,
        params: [testText, `[${embedding.join(',')}]`, JSON.stringify({ test: true })]
      })
    });
    
    const result = await response.json();
    console.log('📊 Response:', result);
    
    if (!response.ok) {
      console.error('❌ Insert failed:', result);
    } else {
      console.log('✅ Insert successful!');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
  
  // Alternative: Try using supabase-js with a query
  console.log('\n💾 Attempting insert via supabase client...');
  const { data, error } = await supabase
    .from('philosophy_documents')
    .insert({
      content: testText,
      embedding: embedding,
      metadata: { test: true, method: 'supabase-js' }
    })
    .select();
    
  if (error) {
    console.error('❌ Supabase client insert error:', error);
  } else {
    console.log('✅ Supabase client insert successful:', data);
  }
}

testInsert().catch(console.error);
