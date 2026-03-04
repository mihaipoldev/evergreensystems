-- =========================================================
-- Create subject_types Table
-- =========================================================
-- This migration creates a subject_types lookup table that defines
-- the available research subject types (niche, client, internal, partner)
-- =========================================================

-- =========================================================
-- 1) Create subject_types table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subject_types (
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
CREATE INDEX IF NOT EXISTS idx_subject_types_name 
  ON public.subject_types(name);

CREATE INDEX IF NOT EXISTS idx_subject_types_enabled 
  ON public.subject_types(enabled);

-- =========================================================
-- 3) Enable RLS
-- =========================================================
ALTER TABLE public.subject_types ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 4) RLS Policies
-- =========================================================
-- Authenticated users can view subject_types
CREATE POLICY "Authenticated users can view subject_types"
  ON public.subject_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert subject_types
CREATE POLICY "Authenticated users can insert subject_types"
  ON public.subject_types
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update subject_types
CREATE POLICY "Authenticated users can update subject_types"
  ON public.subject_types
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete subject_types
CREATE POLICY "Authenticated users can delete subject_types"
  ON public.subject_types
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =========================================================
-- 5) Seed initial types
-- =========================================================
INSERT INTO public.subject_types (name, label, icon, description) VALUES
('niche', 'Niche Research', '📊', 'Research potential market niches'),
('client', 'Client Projects', '📁', 'Active client engagement projects'),
('internal', 'Internal Operations', '🏢', 'Internal company operations and initiatives'),
('partner', 'Partner Projects', '🤝', 'Collaborative projects with partners')
ON CONFLICT (name) DO NOTHING;

