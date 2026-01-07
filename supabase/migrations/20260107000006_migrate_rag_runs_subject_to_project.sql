-- =========================================================
-- Migrate rag_runs subject_id to project_id
-- =========================================================
-- This migration adds project_id column back to rag_runs and
-- populates it from subject_id using the mapping table from Step 2.1.
-- This is Phase 2.3 of consolidating research_subjects into projects
-- =========================================================

-- =========================================================
-- 1) Add project_id column to rag_runs (if it doesn't exist)
-- =========================================================
-- Note: project_id was removed in a previous migration, so we need to add it back
ALTER TABLE public.rag_runs
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create index for project_id
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_id 
  ON public.rag_runs(project_id);

-- =========================================================
-- 2) Update rag_runs to populate project_id from subject_id
-- =========================================================
-- Use the mapping table to find corresponding project_id
-- for each subject_id, then update rag_runs
-- Keep subject_id populated (dual write for safety)

UPDATE public.rag_runs r
SET project_id = m.project_id
FROM public.research_subject_to_project_mapping m
WHERE r.subject_id = m.research_subject_id
  AND r.project_id IS NULL;

-- =========================================================
-- Note: subject_id column remains populated during migration
-- phase for safety. It will be removed in Phase 5 cleanup.

