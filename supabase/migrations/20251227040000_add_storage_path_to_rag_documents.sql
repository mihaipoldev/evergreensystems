-- Add storage_path column to rag_documents table
-- This stores the relative path of files in Bunny storage
-- Nullable because text content won't have files

ALTER TABLE public.rag_documents
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Add index for efficient lookups by storage path
CREATE INDEX IF NOT EXISTS rag_documents_storage_path_idx
  ON public.rag_documents (storage_path);

