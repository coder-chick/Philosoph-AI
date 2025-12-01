-- Create the documents table for storing philosophy book chunks
CREATE TABLE IF NOT EXISTS public.documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the embedding column for similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON public.documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create an index on metadata for filtering
CREATE INDEX IF NOT EXISTS documents_metadata_idx ON public.documents USING gin(metadata);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read documents
CREATE POLICY "Allow public read access" ON public.documents
  FOR SELECT
  USING (true);

-- Create a policy that allows authenticated users to insert documents
CREATE POLICY "Allow authenticated insert access" ON public.documents
  FOR INSERT
  WITH CHECK (true);
