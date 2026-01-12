-- =========================================================
-- Add RLS Policies for Project Documents Table
-- =========================================================
-- This migration adds Row Level Security policies to the project_documents table
-- to block all visitor access and restrict access to authenticated users only.
-- 
-- Critical Security Fix: Project_documents table currently has NO RLS policies,
-- allowing anonymous users full CRUD access to sensitive project-document relationships.
-- =========================================================

-- Ensure RLS is enabled on project_documents table
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can view project_documents" ON public.project_documents;
DROP POLICY IF EXISTS "Authenticated users can insert project_documents" ON public.project_documents;
DROP POLICY IF EXISTS "Authenticated users can update project_documents" ON public.project_documents;
DROP POLICY IF EXISTS "Authenticated users can delete project_documents" ON public.project_documents;

-- SELECT: Only authenticated users can view project_documents
CREATE POLICY "Authenticated users can view project_documents"
  ON public.project_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: Only authenticated users can link documents to projects
CREATE POLICY "Authenticated users can insert project_documents"
  ON public.project_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update links
CREATE POLICY "Authenticated users can update project_documents"
  ON public.project_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete links
CREATE POLICY "Authenticated users can delete project_documents"
  ON public.project_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
