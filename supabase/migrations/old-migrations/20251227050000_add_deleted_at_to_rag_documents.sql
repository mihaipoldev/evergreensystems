-- Add deleted_at column to rag_documents table for soft delete functionality
ALTER TABLE public.rag_documents
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add index on deleted_at for efficient filtering of non-deleted records
CREATE INDEX IF NOT EXISTS rag_documents_deleted_at_idx
  ON public.rag_documents (deleted_at);

