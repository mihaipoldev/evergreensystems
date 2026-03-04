-- =========================================================
-- Add RLS Policies for Research Subjects Table
-- =========================================================
-- This migration adds Row Level Security policies to the research_subjects table
-- to allow authenticated users to access research subjects.
-- 
-- Security Fix: research_subjects currently has RLS enabled but NO policies,
-- which blocks all access (even authenticated users). This migration adds
-- proper policies to allow authenticated access.
-- =========================================================

-- Ensure RLS is enabled on research_subjects table
ALTER TABLE public.research_subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can view research_subjects" ON public.research_subjects;
DROP POLICY IF EXISTS "Authenticated users can insert research_subjects" ON public.research_subjects;
DROP POLICY IF EXISTS "Authenticated users can update research_subjects" ON public.research_subjects;
DROP POLICY IF EXISTS "Authenticated users can delete research_subjects" ON public.research_subjects;

-- SELECT: Only authenticated users can view research subjects
CREATE POLICY "Authenticated users can view research_subjects"
  ON public.research_subjects
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: Only authenticated users can create research subjects
CREATE POLICY "Authenticated users can insert research_subjects"
  ON public.research_subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update research subjects
CREATE POLICY "Authenticated users can update research_subjects"
  ON public.research_subjects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete research subjects
CREATE POLICY "Authenticated users can delete research_subjects"
  ON public.research_subjects
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
