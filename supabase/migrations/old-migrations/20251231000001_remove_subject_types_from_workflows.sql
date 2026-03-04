-- =========================================================
-- Remove subject_types Column from Workflows Table
-- =========================================================
-- This migration removes the subject_types array column from the workflows table.
-- The workflow-subject type relationship is now handled by the workflow_subject_types junction table.
-- =========================================================

-- =========================================================
-- 1) Drop the GIN index on subject_types
-- =========================================================
DROP INDEX IF EXISTS public.idx_workflows_subject_types;

-- =========================================================
-- 2) Drop constraints on subject_types
-- =========================================================
ALTER TABLE public.workflows
DROP CONSTRAINT IF EXISTS check_subject_types;

ALTER TABLE public.workflows
DROP CONSTRAINT IF EXISTS check_subject_types_not_empty;

-- =========================================================
-- 3) Remove subject_types column
-- =========================================================
ALTER TABLE public.workflows
DROP COLUMN IF EXISTS subject_types;

