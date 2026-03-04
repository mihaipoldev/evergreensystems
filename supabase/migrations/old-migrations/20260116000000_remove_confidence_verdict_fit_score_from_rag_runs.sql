-- ============================================================================
-- Remove confidence, verdict, and fit_score columns from rag_runs table
-- These fields should be extracted from metadata instead
-- ============================================================================

-- Drop the index that includes these columns
DROP INDEX IF EXISTS idx_rag_runs_project_workflow_created_include;

-- Drop the columns from rag_runs table
ALTER TABLE public.rag_runs
  DROP COLUMN IF EXISTS confidence,
  DROP COLUMN IF EXISTS verdict,
  DROP COLUMN IF EXISTS fit_score;

-- Recreate the index without the dropped columns
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_workflow_created_include 
ON public.rag_runs(project_id, workflow_id, created_at DESC)
INCLUDE (status);

