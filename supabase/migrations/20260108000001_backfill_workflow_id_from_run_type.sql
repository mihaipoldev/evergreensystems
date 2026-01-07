-- =========================================================
-- Backfill workflow_id from run_type
-- =========================================================
-- This migration:
-- 1. Creates workflows for each run_type value if they don't exist
-- 2. Backfills workflow_id for existing runs based on their run_type
-- =========================================================

-- =========================================================
-- 1) Create workflows for each run_type if they don't exist
-- =========================================================

-- Create niche_intelligence workflow
INSERT INTO public.workflows (name, label, description, enabled, knowledge_base_target)
SELECT 
  'niche_intelligence',
  'Niche Intelligence',
  'Research and intelligence gathering for niche markets',
  true,
  'knowledgebase'
WHERE NOT EXISTS (
  SELECT 1 FROM public.workflows WHERE name = 'niche_intelligence'
);

-- Create kb_query workflow
INSERT INTO public.workflows (name, label, description, enabled, knowledge_base_target)
SELECT 
  'kb_query',
  'KB Query',
  'Query knowledge base for information',
  true,
  'knowledgebase'
WHERE NOT EXISTS (
  SELECT 1 FROM public.workflows WHERE name = 'kb_query'
);

-- Create doc_ingest workflow
INSERT INTO public.workflows (name, label, description, enabled, knowledge_base_target)
SELECT 
  'doc_ingest',
  'Document Ingest',
  'Ingest documents into knowledge base',
  true,
  'knowledgebase'
WHERE NOT EXISTS (
  SELECT 1 FROM public.workflows WHERE name = 'doc_ingest'
);

-- =========================================================
-- 2) Backfill workflow_id for existing runs
-- =========================================================

-- Update runs with niche_intelligence run_type
UPDATE public.rag_runs
SET workflow_id = (
  SELECT id FROM public.workflows WHERE name = 'niche_intelligence' LIMIT 1
)
WHERE run_type = 'niche_intelligence' 
  AND workflow_id IS NULL;

-- Update runs with kb_query run_type
UPDATE public.rag_runs
SET workflow_id = (
  SELECT id FROM public.workflows WHERE name = 'kb_query' LIMIT 1
)
WHERE run_type = 'kb_query' 
  AND workflow_id IS NULL;

-- Update runs with doc_ingest run_type
UPDATE public.rag_runs
SET workflow_id = (
  SELECT id FROM public.workflows WHERE name = 'doc_ingest' LIMIT 1
)
WHERE run_type = 'doc_ingest' 
  AND workflow_id IS NULL;

-- =========================================================
-- 3) Verify backfill results
-- =========================================================
DO $$
DECLARE
  runs_without_workflow INTEGER;
BEGIN
  SELECT COUNT(*) INTO runs_without_workflow
  FROM public.rag_runs
  WHERE workflow_id IS NULL;
  
  IF runs_without_workflow > 0 THEN
    RAISE NOTICE 'Warning: % runs still have NULL workflow_id', runs_without_workflow;
  ELSE
    RAISE NOTICE 'Success: All runs now have workflow_id';
  END IF;
END $$;

