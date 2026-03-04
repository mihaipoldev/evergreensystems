-- =========================================================
-- Create workflow_subject_types Table
-- =========================================================
-- This migration creates a junction table that links workflows 
-- to subject types with a display order
-- =========================================================

-- =========================================================
-- 1) Create workflow_subject_types table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.workflow_subject_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workflow_id, subject_type)
);

-- =========================================================
-- 2) Create indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_workflow_subject_type_order 
  ON public.workflow_subject_types(subject_type, display_order);

CREATE INDEX IF NOT EXISTS idx_workflow_subject_types_workflow_id 
  ON public.workflow_subject_types(workflow_id);

-- =========================================================
-- 3) Enable RLS
-- =========================================================
ALTER TABLE public.workflow_subject_types ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 4) RLS Policies
-- =========================================================
-- Authenticated users can view workflow_subject_types
CREATE POLICY "Authenticated users can view workflow_subject_types"
  ON public.workflow_subject_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert workflow_subject_types
CREATE POLICY "Authenticated users can insert workflow_subject_types"
  ON public.workflow_subject_types
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update workflow_subject_types
CREATE POLICY "Authenticated users can update workflow_subject_types"
  ON public.workflow_subject_types
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete workflow_subject_types
CREATE POLICY "Authenticated users can delete workflow_subject_types"
  ON public.workflow_subject_types
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

