-- =========================================================
-- Make run_type nullable for backward compatibility
-- =========================================================
-- This migration makes run_type nullable to support the transition
-- from run_type to workflow_id. New runs should use workflow_id,
-- but run_type is kept for backward compatibility with old data.
-- =========================================================

-- Make run_type nullable
ALTER TABLE public.rag_runs
  ALTER COLUMN run_type DROP NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN public.rag_runs.run_type IS 
'Deprecated: Use workflow_id instead. Kept for backward compatibility. Can be NULL for new runs.';

COMMENT ON COLUMN public.rag_runs.workflow_id IS 
'Primary identifier for the workflow that generated this run. Should not be NULL for new runs.';

