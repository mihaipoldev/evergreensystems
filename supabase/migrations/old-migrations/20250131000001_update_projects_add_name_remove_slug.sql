-- =========================================================
-- Update Projects Table: Add name field, Remove slug field
-- =========================================================
-- This migration modifies the projects table to:
-- 1. Add a name field to projects
-- 2. Remove the slug field from projects
-- =========================================================

-- =========================================================
-- 1) Drop index on slug field
-- =========================================================
DROP INDEX IF EXISTS idx_projects_slug;

-- =========================================================
-- 2) Add name field to projects table
-- =========================================================
-- Add column as nullable first
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing rows to set name from client_name
UPDATE public.projects
SET name = client_name
WHERE name IS NULL;

-- Now make it NOT NULL
ALTER TABLE public.projects
  ALTER COLUMN name SET NOT NULL;

-- =========================================================
-- 3) Remove slug field from projects table
-- =========================================================
-- First, drop the unique constraint on slug (if it exists as a separate constraint)
-- Note: The UNIQUE constraint is part of the column definition, so dropping the column will handle it
ALTER TABLE public.projects
  DROP COLUMN IF EXISTS slug;

-- =========================================================
-- 4) Create index on name field for better query performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_projects_name ON public.projects(name);

