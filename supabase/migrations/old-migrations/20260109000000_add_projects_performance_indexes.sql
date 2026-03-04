-- ============================================================================
-- Performance indexes for projects page
-- These indexes will significantly improve query performance for the projects
-- list page, especially when filtering by project type, status, and fetching
-- niche intelligence data.
-- ============================================================================

-- ============================================================================
-- PROJECTS TABLE INDEXES
-- ============================================================================

-- Partial index for filtering non-archived projects (most common query)
-- This is the most frequently used filter in the projects page
CREATE INDEX IF NOT EXISTS idx_projects_archived_at 
ON public.projects(archived_at) 
WHERE archived_at IS NULL;

-- Composite index for project type filtering with archived check
-- Optimizes: WHERE project_type_id = ? AND archived_at IS NULL
CREATE INDEX IF NOT EXISTS idx_projects_type_archived 
ON public.projects(project_type_id, archived_at) 
WHERE archived_at IS NULL;

-- Index for status filtering
-- Optimizes: WHERE status = ? AND archived_at IS NULL
CREATE INDEX IF NOT EXISTS idx_projects_status 
ON public.projects(status) 
WHERE archived_at IS NULL;

-- Index for kb_id (used for joining with documents if needed in future)
CREATE INDEX IF NOT EXISTS idx_projects_kb_id 
ON public.projects(kb_id);

-- Index for ordering by created_at DESC
-- Optimizes: ORDER BY created_at DESC WHERE archived_at IS NULL
CREATE INDEX IF NOT EXISTS idx_projects_created_at_desc 
ON public.projects(created_at DESC) 
WHERE archived_at IS NULL;

-- Index for client_name search (ILIKE queries)
-- Optimizes: WHERE client_name ILIKE ? AND archived_at IS NULL
CREATE INDEX IF NOT EXISTS idx_projects_client_name 
ON public.projects(client_name) 
WHERE archived_at IS NULL;

-- ============================================================================
-- RAG_RUNS TABLE INDEXES
-- ============================================================================

-- Composite index for niche intelligence queries
-- Optimizes: WHERE project_id IN (...) AND workflow_id = ? AND status = 'complete' ORDER BY created_at DESC
-- This is the most critical index for niche project performance
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_workflow_status_created 
ON public.rag_runs(project_id, workflow_id, status, created_at DESC);

-- Index for project_id lookups
-- Optimizes: WHERE project_id IN (...)
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_id 
ON public.rag_runs(project_id);

-- Index for workflow_id filtering
-- Optimizes: WHERE workflow_id = ?
CREATE INDEX IF NOT EXISTS idx_rag_runs_workflow_id 
ON public.rag_runs(workflow_id);

-- ============================================================================
-- WORKFLOWS TABLE INDEXES
-- ============================================================================

-- Partial index for workflow name lookups
-- Optimizes: WHERE name = 'niche_intelligence'
CREATE INDEX IF NOT EXISTS idx_workflows_name 
ON public.workflows(name) 
WHERE name = 'niche_intelligence';

-- ============================================================================
-- RAG_RUN_OUTPUTS TABLE INDEXES
-- ============================================================================

-- Index for run_id joins (verify if this already exists, but create if not)
-- This is used when joining rag_run_outputs with rag_runs
CREATE INDEX IF NOT EXISTS idx_rag_run_outputs_run_id 
ON public.rag_run_outputs(run_id);




