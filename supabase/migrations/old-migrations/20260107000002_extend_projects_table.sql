-- =========================================================
-- Extend Projects Table with Project Type and Niche Research Fields
-- =========================================================
-- This migration adds new columns to the projects table to support
-- the consolidation of research_subjects into projects.
-- This is Phase 1.2 of consolidating research_subjects into projects
-- =========================================================

-- =========================================================
-- 1) Add project_type_id foreign key column (nullable initially)
-- =========================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_type_id UUID REFERENCES public.project_types(id) ON DELETE SET NULL;

-- Create index for project_type_id
CREATE INDEX IF NOT EXISTS idx_projects_project_type_id 
  ON public.projects(project_type_id);

-- =========================================================
-- 2) Add niche research fields (all nullable)
-- =========================================================
-- geography - for filtering niche research by location
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS geography TEXT;

-- category - for categorizing niche research
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS category TEXT;

-- first_researched_at - auto-populated when first run executes
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS first_researched_at TIMESTAMPTZ;

-- last_researched_at - auto-updated on each run
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS last_researched_at TIMESTAMPTZ;

-- run_count - tracks number of research runs
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS run_count INTEGER DEFAULT 0;

-- =========================================================
-- 3) Create indexes for niche research fields
-- =========================================================
-- Index for geography filtering
CREATE INDEX IF NOT EXISTS idx_projects_geography 
  ON public.projects(geography);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_projects_category 
  ON public.projects(category);

-- =========================================================
-- Note: Existing columns (type TEXT, client_name) are kept for
-- backward compatibility during migration phase. They will be
-- removed in Phase 5 cleanup.

