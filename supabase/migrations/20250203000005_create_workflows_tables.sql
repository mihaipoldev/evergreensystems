-- =========================================================
-- Create Workflows Tables
-- =========================================================
-- This migration creates the workflows and workflow_secrets tables
-- workflows: Stores workflow definitions (metadata visible to frontend)
-- workflow_secrets: Stores secure n8n webhook URLs (backend only)
-- =========================================================

-- =========================================================
-- 1) Create workflows table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name TEXT UNIQUE NOT NULL,              -- 'niche_intelligence', 'icp_research'
  label TEXT NOT NULL,                    -- 'Niche Intelligence', 'ICP Research'
  description TEXT,
  icon TEXT,                              -- '📊', '👥'
  
  -- UI Info
  estimated_cost DECIMAL(10,2),
  estimated_time_minutes INTEGER,
  input_schema JSONB,                     -- What form fields to show
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 2) Create workflow_secrets table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.workflow_secrets (
  workflow_id UUID PRIMARY KEY REFERENCES public.workflows(id) ON DELETE CASCADE,
  
  webhook_url TEXT NOT NULL,              -- n8n webhook endpoint
  api_key TEXT,                           -- Future: if needed
  config JSONB,                           -- Future: additional secrets
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 3) Create indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_workflows_name 
  ON public.workflows(name);
CREATE INDEX IF NOT EXISTS idx_workflows_enabled 
  ON public.workflows(enabled);

-- =========================================================
-- 4) Enable RLS
-- =========================================================
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_secrets ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 5) RLS Policies for workflows
-- =========================================================
-- Authenticated users can view workflows
CREATE POLICY "Authenticated users can view workflows"
  ON public.workflows
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert workflows
CREATE POLICY "Authenticated users can insert workflows"
  ON public.workflows
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update workflows
CREATE POLICY "Authenticated users can update workflows"
  ON public.workflows
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete workflows
CREATE POLICY "Authenticated users can delete workflows"
  ON public.workflows
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =========================================================
-- 6) RLS Policies for workflow_secrets
-- =========================================================
-- Only service role can access secrets (frontend CANNOT see this)
CREATE POLICY "Only service role can access secrets"
  ON public.workflow_secrets
  FOR ALL
  TO service_role
  USING (true);

