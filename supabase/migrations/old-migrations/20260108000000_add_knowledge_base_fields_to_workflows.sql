-- =========================================================
-- Add Knowledge Base Fields to Workflows
-- =========================================================
-- This migration adds two new fields to the workflows table:
-- 1. knowledge_base_target: Mandatory text field with CHECK constraint
--    (one of: 'knowledgebase', 'client', 'project')
-- 2. target_knowledge_base_id: Nullable UUID foreign key to rag_knowledge_bases
-- =========================================================

-- Add knowledge_base_target field with CHECK constraint
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS knowledge_base_target TEXT NOT NULL DEFAULT 'knowledgebase'
CHECK (knowledge_base_target IN ('knowledgebase', 'client', 'project'));

-- Add target_knowledge_base_id field (nullable foreign key)
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS target_knowledge_base_id UUID
REFERENCES public.rag_knowledge_bases(id) ON DELETE SET NULL;

-- Create index on target_knowledge_base_id for query performance
CREATE INDEX IF NOT EXISTS idx_workflows_target_knowledge_base_id
ON public.workflows(target_knowledge_base_id);

-- Add comment to document the fields
COMMENT ON COLUMN public.workflows.knowledge_base_target IS 
'Target type for the knowledge base: knowledgebase, client, or project';

COMMENT ON COLUMN public.workflows.target_knowledge_base_id IS 
'Foreign key to rag_knowledge_bases table. Only used when knowledge_base_target is ''knowledgebase''';

