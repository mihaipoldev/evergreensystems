-- =========================================================
-- Migrate research_subjects.type to Foreign Key
-- =========================================================
-- This migration replaces the TEXT `type` column with a UUID
-- foreign key `subject_type_id` that references `subject_types.id`
-- =========================================================

-- =========================================================
-- 1) Drop the existing type column
-- =========================================================
ALTER TABLE public.research_subjects
  DROP COLUMN IF EXISTS type;

-- =========================================================
-- 2) Add subject_type_id column (nullable initially)
-- =========================================================
ALTER TABLE public.research_subjects
  ADD COLUMN IF NOT EXISTS subject_type_id UUID REFERENCES public.subject_types(id) ON DELETE SET NULL;

-- =========================================================
-- 3) Create index for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_research_subjects_subject_type_id 
  ON public.research_subjects(subject_type_id);

-- =========================================================
-- 4) Add NOT NULL constraint
-- Note: This will fail if there are existing NULL values,
-- but user will handle manual assignment first
-- =========================================================
-- ALTER TABLE public.research_subjects
--   ALTER COLUMN subject_type_id SET NOT NULL;

