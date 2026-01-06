-- =========================================================
-- Create Research Subjects Table
-- =========================================================
-- This migration creates the research_subjects table to store
-- niches/subjects that have been researched (AI/ML, 3D Printing, etc.)
-- =========================================================

-- =========================================================
-- 1) Create research_subjects table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.research_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name TEXT NOT NULL,                     -- 'AI/ML Consulting', '3D Printing Services'
  geography TEXT,                         -- 'United States', 'Europe', NULL for global
  category TEXT,                          -- 'B2B Services', 'Manufacturing', etc.
  description TEXT,
  
  -- Auto-populated
  first_researched_at TIMESTAMPTZ,
  last_researched_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,            -- How many times researched
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 2) Create unique index: same name+geography = same subject
-- =========================================================
-- Unique constraint: same name+geography = same subject
CREATE UNIQUE INDEX IF NOT EXISTS idx_subject_name_geo 
  ON public.research_subjects(name, COALESCE(geography, ''));

-- =========================================================
-- 3) Add RLS policies (if needed in the future)
-- =========================================================
-- Note: RLS policies can be added in a separate migration if needed
ALTER TABLE public.research_subjects ENABLE ROW LEVEL SECURITY;

