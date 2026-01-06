-- =========================================================
-- Add Type Field to Projects Table
-- =========================================================
-- This migration adds a type field to the projects table
-- to categorize projects as: niche_research, client, or internal
-- =========================================================

-- =========================================================
-- 1) Add type column to projects table
-- =========================================================
-- Add column as nullable first with default value
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'client' CHECK (type IN ('niche_research', 'client', 'internal'));

-- Update existing rows to set type to 'client' if NULL
UPDATE public.projects
SET type = 'client'
WHERE type IS NULL;

-- Now make it NOT NULL since we've set defaults
ALTER TABLE public.projects
  ALTER COLUMN type SET NOT NULL;

-- =========================================================
-- 2) Create index on type field for better query performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(type);

