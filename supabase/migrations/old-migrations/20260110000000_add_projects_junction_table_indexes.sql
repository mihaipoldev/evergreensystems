-- ============================================================================
-- Performance indexes for projects junction tables
-- These indexes optimize queries involving project_documents, rag_documents,
-- and rag_runs junction tables used in the projects page
-- ============================================================================

-- ============================================================================
-- PROJECT_DOCUMENTS JUNCTION TABLE INDEXES
-- ============================================================================

-- Composite index for faster joins when fetching linked documents
-- Optimizes: SELECT * FROM project_documents pd 
--            JOIN rag_documents rd ON pd.document_id = rd.id 
--            WHERE pd.project_id = ?
CREATE INDEX IF NOT EXISTS idx_project_documents_project_document 
ON public.project_documents(project_id, document_id);

-- ============================================================================
-- RAG_DOCUMENTS TABLE INDEXES (for workspace document queries)
-- ============================================================================

-- Composite index for workspace document queries
-- Optimizes: WHERE knowledge_base_id = ? AND deleted_at IS NULL ORDER BY created_at DESC
-- This is used extensively in project detail pages
CREATE INDEX IF NOT EXISTS idx_rag_documents_kb_deleted_created 
ON public.rag_documents(knowledge_base_id, deleted_at, created_at DESC) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- RAG_RUNS TABLE INDEXES (for project-specific run queries)
-- ============================================================================

-- Index for ordering runs by project and creation date
-- Optimizes: WHERE project_id = ? ORDER BY created_at DESC
-- This is used in project detail pages to show runs chronologically
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_created_desc 
ON public.rag_runs(project_id, created_at DESC);

-- ============================================================================
-- PROJECT_TYPE_WORKFLOWS JUNCTION TABLE INDEXES
-- ============================================================================

-- Composite index for filtering enabled workflows by project type
-- Optimizes: SELECT * FROM project_type_workflows ptw
--            JOIN workflows w ON ptw.workflow_id = w.id
--            WHERE ptw.project_type_id = ? AND w.enabled = true
CREATE INDEX IF NOT EXISTS idx_project_type_workflows_type_workflow 
ON public.project_type_workflows(project_type_id, workflow_id);

-- ============================================================================
-- NOTES
-- ============================================================================
-- These indexes complement existing indexes:
-- - idx_project_documents_project_id (already exists)
-- - idx_project_documents_document_id (already exists)
-- - idx_rag_runs_project_workflow_status_created (already exists)
-- - idx_project_type_workflows_project_type_id_order (already exists)
--
-- The new indexes optimize specific query patterns:
-- 1. Joining project_documents with rag_documents
-- 2. Querying workspace documents by KB with deleted_at filter
-- 3. Ordering runs by project and creation date
-- 4. Filtering enabled workflows by project type

