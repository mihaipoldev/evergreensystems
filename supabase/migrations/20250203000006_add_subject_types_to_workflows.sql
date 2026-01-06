-- =========================================================
-- Add subject_types Array to Workflows Table
-- =========================================================
-- This migration adds a subject_types array column to the workflows table
-- to control which workflows appear for different research subject types.
-- Also updates RLS policies to use auth.uid() for consistency.
-- =========================================================

-- =========================================================
-- 1) Add subject_types column
-- =========================================================
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS subject_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- =========================================================
-- 2) Create GIN index for efficient array queries
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_workflows_subject_types 
ON public.workflows USING GIN(subject_types);

-- =========================================================
-- 3) Update existing workflows with default values
-- =========================================================
UPDATE public.workflows 
SET subject_types = ARRAY['niche']::TEXT[]
WHERE subject_types IS NULL OR subject_types = ARRAY[]::TEXT[];

-- =========================================================
-- 4) Add check constraint to validate subject type values
-- =========================================================
ALTER TABLE public.workflows
ADD CONSTRAINT check_subject_types 
CHECK (
  subject_types <@ ARRAY['niche', 'client', 'internal', 'partner']::TEXT[]
);

-- =========================================================
-- 5) Add constraint to prevent empty arrays
-- =========================================================
ALTER TABLE public.workflows
ADD CONSTRAINT check_subject_types_not_empty
CHECK (array_length(subject_types, 1) > 0);

-- =========================================================
-- 6) Update RLS policies to use auth.uid() instead of auth.role()
-- =========================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view workflows" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated users can insert workflows" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated users can update workflows" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated users can delete workflows" ON public.workflows;

-- Create new policies using auth.uid()
CREATE POLICY "Authenticated users can view workflows"
  ON public.workflows FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update workflows"
  ON public.workflows FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete workflows"
  ON public.workflows FOR DELETE
  USING (auth.uid() IS NOT NULL);

