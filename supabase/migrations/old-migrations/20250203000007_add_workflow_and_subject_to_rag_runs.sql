-- =========================================================
-- Add workflow_id and subject_id to rag_runs table
-- =========================================================
-- This migration links rag_runs to workflows and research_subjects
-- Now each run stores:
--   - knowledge_base_id: Which KB it outputs to
--   - workflow_id: What workflow generated it
--   - subject_id: What niche it's about (if applicable)
-- =========================================================

-- =========================================================
-- 1) Add workflow_id column
-- =========================================================
ALTER TABLE public.rag_runs
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL;

-- =========================================================
-- 2) Add subject_id column
-- =========================================================
ALTER TABLE public.rag_runs
  ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.research_subjects(id) ON DELETE SET NULL;

-- =========================================================
-- 3) Create indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_runs_workflow 
  ON public.rag_runs(workflow_id);

CREATE INDEX IF NOT EXISTS idx_runs_subject 
  ON public.rag_runs(subject_id);

