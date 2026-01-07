-- =========================================================
-- Remove run_type column from rag_runs table
-- =========================================================
-- This migration completely removes the run_type column as we've
-- fully migrated to using workflow_id as the primary identifier.
-- =========================================================

-- Drop the index on run_type (if it exists)
DROP INDEX IF EXISTS public.rag_runs_run_type_idx;

-- Drop the run_type column
ALTER TABLE public.rag_runs
  DROP COLUMN IF EXISTS run_type;

