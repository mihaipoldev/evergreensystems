-- =========================================================
-- Cleanup: Remove Old Research Subjects Tables
-- =========================================================
-- This migration removes the old research_subjects structure.
-- We're starting fresh with projects only.
-- =========================================================

-- Drop old tables (CASCADE will handle dependencies)
DROP TABLE IF EXISTS public.research_subject_to_project_mapping CASCADE;
DROP TABLE IF EXISTS public.research_documents CASCADE;
DROP TABLE IF EXISTS public.research_subjects CASCADE;
DROP TABLE IF EXISTS public.subject_types CASCADE;
DROP TABLE IF EXISTS public.workflow_subject_types CASCADE;

-- Remove subject_id column from rag_runs if it exists
ALTER TABLE public.rag_runs
  DROP COLUMN IF EXISTS subject_id;

