-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text, -- The text chunk
  metadata jsonb, -- Extra info: author, title, book_id, etc.
  embedding vector(768) -- 768 dimensions for Gemini embeddings
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter jsonb default '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql stable as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  and documents.metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create an index for faster querying (IVFFlat)
-- Note: This is optional for small datasets but good for performance later
create index on documents using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
