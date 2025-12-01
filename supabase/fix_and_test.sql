-- Step 1: Drop and recreate the table
DROP TABLE IF EXISTS philosophy_documents;

CREATE TABLE philosophy_documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for vector similarity search
CREATE INDEX philosophy_documents_embedding_idx 
ON philosophy_documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Step 3: Enable RLS (optional, disable for testing)
ALTER TABLE philosophy_documents ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy to allow all operations for testing
CREATE POLICY "Allow all for testing" 
ON philosophy_documents 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Step 5: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Step 6: Insert a test row with a sample embedding
INSERT INTO philosophy_documents (content, embedding, metadata)
VALUES (
  'Philosophy is the study of general and fundamental questions about existence, knowledge, values, reason, mind, and language.',
  array_fill(0.0, ARRAY[768])::vector(768), -- Placeholder embedding
  '{"test": true, "source": "sql_test"}'::jsonb
)
RETURNING id, created_at;

-- Step 7: Query to verify
SELECT id, substring(content, 1, 50) as content_preview, metadata, created_at
FROM philosophy_documents
LIMIT 5;
