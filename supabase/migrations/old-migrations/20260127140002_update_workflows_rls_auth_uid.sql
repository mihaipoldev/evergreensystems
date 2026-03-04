-- =========================================================
-- Update Workflows Table RLS Policies to Use auth.uid()
-- =========================================================
-- This migration updates the workflows table RLS policies to use
-- auth.uid() IS NOT NULL instead of auth.role() = 'authenticated'
-- for more reliable authentication checks and consistency with
-- the rest of the codebase.
-- 
-- This is a MEDIUM priority improvement that enhances security
-- reliability and follows the pattern established in migration
-- 20251206120009_fix_all_rls_policies_auth_uid.sql
-- =========================================================

-- Drop existing policies that use auth.role() = 'authenticated'
DROP POLICY IF EXISTS "Authenticated users can view workflows" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated users can insert workflows" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated users can update workflows" ON public.workflows;
DROP POLICY IF EXISTS "Authenticated users can delete workflows" ON public.workflows;

-- Recreate SELECT policy using auth.uid()
CREATE POLICY "Authenticated users can view workflows"
  ON public.workflows
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Recreate INSERT policy using auth.uid()
CREATE POLICY "Authenticated users can insert workflows"
  ON public.workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Recreate UPDATE policy using auth.uid()
CREATE POLICY "Authenticated users can update workflows"
  ON public.workflows
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Recreate DELETE policy using auth.uid()
CREATE POLICY "Authenticated users can delete workflows"
  ON public.workflows
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
