-- =========================================================
-- Create project_type_workflows Table
-- =========================================================
-- This migration creates a junction table that links project types
-- to workflows with a display order.
-- This is Phase 1.3 of consolidating research_subjects into projects
-- =========================================================

-- =========================================================
-- 1) Create project_type_workflows table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.project_type_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type_id UUID NOT NULL REFERENCES public.project_types(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_type_id, workflow_id)
);

-- =========================================================
-- 2) Create indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_project_type_workflows_project_type_id_order 
  ON public.project_type_workflows(project_type_id, display_order);

CREATE INDEX IF NOT EXISTS idx_project_type_workflows_workflow_id 
  ON public.project_type_workflows(workflow_id);

-- =========================================================
-- 3) Enable RLS
-- =========================================================
ALTER TABLE public.project_type_workflows ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 4) RLS Policies
-- =========================================================
-- Authenticated users can view project_type_workflows
CREATE POLICY "Authenticated users can view project_type_workflows"
  ON public.project_type_workflows
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert project_type_workflows
CREATE POLICY "Authenticated users can insert project_type_workflows"
  ON public.project_type_workflows
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update project_type_workflows
CREATE POLICY "Authenticated users can update project_type_workflows"
  ON public.project_type_workflows
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete project_type_workflows
CREATE POLICY "Authenticated users can delete project_type_workflows"
  ON public.project_type_workflows
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =========================================================
-- 5) Migrate data from workflow_subject_types to project_type_workflows
-- =========================================================
-- Map subject_type_id to project_type_id by matching names
-- This ensures the same workflow-type relationships exist in both tables
INSERT INTO public.project_type_workflows (project_type_id, workflow_id, display_order, created_at)
SELECT 
  pt.id as project_type_id,
  wst.workflow_id,
  wst.display_order,
  wst.created_at
FROM public.workflow_subject_types wst
JOIN public.subject_types st ON wst.subject_type_id = st.id
JOIN public.project_types pt ON st.name = pt.name
ON CONFLICT (project_type_id, workflow_id) DO NOTHING;

-- =========================================================
-- Note: workflow_subject_types table remains intact for parallel
-- operation during migration. It will be dropped in Phase 5 cleanup.

