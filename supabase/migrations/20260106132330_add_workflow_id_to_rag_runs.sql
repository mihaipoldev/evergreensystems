-- =========================================================
-- Add workflow_id to rag_runs table
-- =========================================================
-- This migration adds workflow_id column to rag_runs table
-- linking each run to the workflow that generated it
-- =========================================================

-- =========================================================
-- 1) Add workflow_id column
-- =========================================================
ALTER TABLE public.rag_runs
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL;

-- =========================================================
-- 2) Create index for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_runs_workflow 
  ON public.rag_runs(workflow_id);

