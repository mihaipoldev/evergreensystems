-- =========================================================
-- Performance Indexes for Knowledge Bases
-- =========================================================
-- This migration adds composite indexes to optimize common
-- query patterns for knowledge bases and documents
-- =========================================================

-- Index for knowledge bases default sorting (created_at DESC)
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_bases_created_at_desc
  ON public.rag_knowledge_bases (created_at DESC);

-- Index for knowledge bases "Recent" sorting (updated_at DESC)
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_bases_updated_at_desc
  ON public.rag_knowledge_bases (updated_at DESC);

-- Composite index for efficient document count queries
-- This optimizes: WHERE knowledge_base_id = X AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_rag_documents_kb_deleted_at
  ON public.rag_documents (knowledge_base_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Index for document listing by knowledge base (created_at DESC)
-- This optimizes: WHERE knowledge_base_id = X AND deleted_at IS NULL ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_rag_documents_kb_created_at_desc
  ON public.rag_documents (knowledge_base_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Composite index for status filtering
-- This optimizes: WHERE knowledge_base_id = X AND status = Y AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_rag_documents_kb_status_deleted
  ON public.rag_documents (knowledge_base_id, status, deleted_at)
  WHERE deleted_at IS NULL;

-- Index for runs count queries by knowledge base
-- This optimizes: WHERE knowledge_base_id = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_rag_runs_kb_created_at_desc
  ON public.rag_runs (knowledge_base_id, created_at DESC);

