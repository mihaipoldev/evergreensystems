-- Make content and content_hash nullable in rag_documents table
-- This allows documents to be created before content is extracted/processed

ALTER TABLE public.rag_documents
  ALTER COLUMN content DROP NOT NULL,
  ALTER COLUMN content_hash DROP NOT NULL;


