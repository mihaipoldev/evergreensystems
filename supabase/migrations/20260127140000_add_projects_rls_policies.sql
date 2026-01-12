-- =========================================================
-- Add RLS Policies for Projects Table
-- =========================================================
-- This migration adds Row Level Security policies to the projects table
-- to block all visitor access and restrict access to authenticated users only.
-- 
-- Critical Security Fix: Projects table currently has NO RLS policies,
-- allowing anonymous users full CRUD access to sensitive client and intel data.
-- =========================================================

-- Ensure RLS is enabled on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- SELECT: Only authenticated users can view projects
CREATE POLICY "Authenticated users can view projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: Only authenticated users can create projects
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update projects
CREATE POLICY "Authenticated users can update projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete projects
CREATE POLICY "Authenticated users can delete projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
