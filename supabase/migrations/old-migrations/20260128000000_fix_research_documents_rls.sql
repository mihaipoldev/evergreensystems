-- =========================================================
-- Fix Research Documents RLS - Remove Public Read Access
-- =========================================================
-- This migration removes the public read policy from research_documents
-- and replaces it with authenticated-only access.
-- 
-- Security Fix: research_documents currently allows public read access,
-- exposing sensitive intel data to anonymous visitors.
-- =========================================================

-- Drop the public read policy
DROP POLICY IF EXISTS "Public can view research_documents" ON public.research_documents;

-- Create authenticated-only read policy
CREATE POLICY "Authenticated users can view research_documents"
  ON public.research_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Note: INSERT/UPDATE/DELETE policies already require authentication
-- but update them to use auth.uid() for consistency
DROP POLICY IF EXISTS "Authenticated users can insert research_documents" ON public.research_documents;
DROP POLICY IF EXISTS "Authenticated users can update research_documents" ON public.research_documents;
DROP POLICY IF EXISTS "Authenticated users can delete research_documents" ON public.research_documents;

CREATE POLICY "Authenticated users can insert research_documents"
  ON public.research_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update research_documents"
  ON public.research_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete research_documents"
  ON public.research_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
