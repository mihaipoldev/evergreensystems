-- ============================================================================
-- Additional Performance Indexes for Project Detail Page
-- These indexes optimize specific query patterns used in the project detail page
-- and complement existing indexes from 20260110000000
-- ============================================================================

-- ============================================================================
-- PROJECT_DOCUMENTS JUNCTION TABLE - Additional Indexes
-- ============================================================================

-- Index for ordering project_documents by creation date
-- Optimizes: SELECT ... FROM project_documents WHERE project_id = ? 
--            ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id_created_at 
ON public.project_documents(project_id, created_at DESC);

-- ============================================================================
-- RAG_DOCUMENTS TABLE - Additional Indexes
-- ============================================================================

-- Index for document status filtering (used in stats calculations)
-- Optimizes: WHERE status = ? AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_rag_documents_status_deleted 
ON public.rag_documents(status, deleted_at)
WHERE deleted_at IS NULL;

-- Index for chunk_count aggregations (if needed for stats)
-- Optimizes: SUM(chunk_count) WHERE project_id = ? AND deleted_at IS NULL
-- Note: This might not be needed if documents are fetched by kb_id only
-- CREATE INDEX IF NOT EXISTS idx_rag_documents_project_chunk_count 
-- ON public.rag_documents(project_id, chunk_count)
-- WHERE deleted_at IS NULL;

-- ============================================================================
-- RAG_RUNS TABLE - Additional Indexes
-- ============================================================================

-- Composite index with INCLUDE columns for better performance on runs query
-- Optimizes: SELECT id, status, fit_score, verdict, created_at, workflow_id 
--            FROM rag_runs WHERE project_id = ? ORDER BY created_at DESC
-- INCLUDE columns avoid additional lookups
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_workflow_created_include 
ON public.rag_runs(project_id, workflow_id, created_at DESC)
INCLUDE (status, fit_score, verdict);

-- ============================================================================
-- WORKFLOWS TABLE - Additional Indexes
-- ============================================================================

-- Partial index for enabled workflows filtering
-- Optimizes: WHERE enabled = true (used in project_type_workflows queries)
CREATE INDEX IF NOT EXISTS idx_workflows_enabled 
ON public.workflows(enabled)
WHERE enabled = true;

-- ============================================================================
-- PROJECT_TYPE_WORKFLOWS JUNCTION TABLE - Additional Indexes
-- ============================================================================

-- Index with INCLUDE for workflow enabled filtering
-- Optimizes: JOIN workflows ON ptw.workflow_id = w.id WHERE w.enabled = true
-- The INCLUDE helps when we need display_order
CREATE INDEX IF NOT EXISTS idx_project_type_workflows_type_enabled_include 
ON public.project_type_workflows(project_type_id)
INCLUDE (workflow_id, display_order);

-- ============================================================================
-- NOTES
-- ============================================================================
-- These indexes complement existing indexes:
-- - idx_project_documents_project_document (from 20260110000000)
-- - idx_rag_documents_kb_deleted_created (from 20260110000000)
-- - idx_rag_runs_project_created_desc (from 20260110000000)
-- - idx_project_type_workflows_type_workflow (from 20260110000000)
--
-- The new indexes optimize:
-- 1. Ordering project_documents by creation date
-- 2. Filtering documents by status for stats calculations
-- 3. Including frequently accessed columns in runs queries
-- 4. Filtering enabled workflows efficiently
-- 5. Including display_order in project_type_workflows queries




