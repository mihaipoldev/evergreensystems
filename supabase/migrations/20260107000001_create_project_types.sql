-- =========================================================
-- Create project_types Table
-- =========================================================
-- This migration creates a project_types lookup table that defines
-- the available project types (niche, client, internal, partner)
-- This is Phase 1.1 of consolidating research_subjects into projects
-- =========================================================

-- =========================================================
-- 1) Create project_types table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.project_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,           -- "niche", "client", "internal"
  label TEXT NOT NULL,                 -- "Niche Research", "Client Projects"
  description TEXT,
  icon TEXT,                           -- "📊", "📁", "🏢"
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 2) Create indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_project_types_name 
  ON public.project_types(name);

CREATE INDEX IF NOT EXISTS idx_project_types_enabled 
  ON public.project_types(enabled);

-- =========================================================
-- 3) Enable RLS
-- =========================================================
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 4) RLS Policies
-- =========================================================
-- Authenticated users can view project_types
CREATE POLICY "Authenticated users can view project_types"
  ON public.project_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert project_types
CREATE POLICY "Authenticated users can insert project_types"
  ON public.project_types
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update project_types
CREATE POLICY "Authenticated users can update project_types"
  ON public.project_types
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete project_types
CREATE POLICY "Authenticated users can delete project_types"
  ON public.project_types
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =========================================================
-- 5) Copy data from subject_types to project_types
-- =========================================================
-- Copy all existing subject_types to project_types
INSERT INTO public.project_types (name, label, icon, description, enabled, created_at, updated_at)
SELECT name, label, icon, description, enabled, created_at, updated_at
FROM public.subject_types
ON CONFLICT (name) DO NOTHING;

-- =========================================================
-- 6) Add updated_at trigger
-- =========================================================
-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_project_types_updated_at ON public.project_types;
CREATE TRIGGER update_project_types_updated_at
  BEFORE UPDATE ON public.project_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

