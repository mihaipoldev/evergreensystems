-- =========================================================
-- Simplify rag_chunks table for standard LangChain/n8n Vector Store compatibility
-- 
-- Changes:
-- 1. Drop detail columns (moved to metadata JSONB)
-- 2. Drop unique index on (document_id, chunk_index)
-- 3. Make knowledge_base_id and document_id nullable
-- =========================================================

-- Step 1: Drop the unique index that depends on chunk_index
DROP INDEX IF EXISTS public.rag_chunks_doc_chunk_index_uq;

-- Step 2: Drop detail columns that will be stored in metadata instead
ALTER TABLE public.rag_chunks
  DROP COLUMN IF EXISTS chunk_index,
  DROP COLUMN IF EXISTS content_hash,
  DROP COLUMN IF EXISTS token_count,
  DROP COLUMN IF EXISTS char_start,
  DROP COLUMN IF EXISTS char_end,
  DROP COLUMN IF EXISTS embedding_model,
  DROP COLUMN IF EXISTS embedding_model_version,
  DROP COLUMN IF EXISTS pipeline_version;

-- Step 3: Make foreign key columns nullable
-- This allows standard vector store nodes to insert without requiring these fields
-- They can be stored in metadata JSONB instead if needed
ALTER TABLE public.rag_chunks
  ALTER COLUMN knowledge_base_id DROP NOT NULL,
  ALTER COLUMN document_id DROP NOT NULL;

-- Note: The following columns are preserved:
-- - id (uuid, primary key)
-- - content (text, not null)
-- - metadata (jsonb, not null, default '{}')
-- - embedding (vector(1536))
-- - created_at (timestamptz, not null, default now())
--
-- The following indexes are preserved:
-- - rag_chunks_kb_doc_idx (on knowledge_base_id, document_id)
-- - rag_chunks_embedding_ivfflat (vector index)

