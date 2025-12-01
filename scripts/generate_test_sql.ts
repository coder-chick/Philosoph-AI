import { generateEmbedding } from '../lib/vertexClient';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testOneEmbedding() {
  console.log('🧪 Generating one test embedding...');
  
  const testText = "Philosophy is the study of general and fundamental questions about existence, knowledge, values, reason, mind, and language.";
  
  const embedding = await generateEmbedding(testText);
  console.log(`✅ Generated embedding with length: ${embedding.length}`);
  console.log(`First 5 values: [${embedding.slice(0, 5).join(', ')}...]`);
  
  // Format for SQL
  const embeddingArray = `[${embedding.join(',')}]`;
  const metadata = JSON.stringify({ test: true, source: 'manual_test' });
  
  console.log('\n📋 SQL to insert this:');
  console.log(`
INSERT INTO public.documents (content, embedding, metadata) 
VALUES (
  '${testText}',
  '${embeddingArray}'::vector,
  '${metadata}'::jsonb
);
  `);
}

testOneEmbedding();
