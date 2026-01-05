-- =========================================================
-- Simplify KB Workspace Architecture
-- =========================================================
-- This migration simplifies the architecture by making KBs the single
-- container pattern. Projects get their own workspace KB, documents only
-- belong to KBs (not projects), and the junction table links projects
-- to research from other KBs.
--
-- Changes:
-- 1. Add 'type' column to rag_knowledge_bases
-- 2. Create workspace KBs for existing projects
-- 3. Rename linked_kb_id to kb_id in projects table
-- 4. Migrate documents from project_id to workspace KBs
-- 5. Migrate runs from project_id to workspace KBs
-- 6. Remove project_id columns
-- =========================================================

-- =========================================================
-- 1) Add 'type' column to rag_knowledge_bases
-- =========================================================

-- Add type column with default value
ALTER TABLE public.rag_knowledge_bases
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'research';

-- Add CHECK constraint for allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rag_knowledge_bases_type_chk'
  ) THEN
    ALTER TABLE public.rag_knowledge_bases
      ADD CONSTRAINT rag_knowledge_bases_type_chk
      CHECK (type IN ('research', 'project', 'company', 'client', 'team'));
  END IF;
END $$;

-- Add index on type
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_bases_type 
  ON public.rag_knowledge_bases(type);

-- Update existing KBs that might be project workspaces (if linked_kb_id exists)
-- We'll handle this in step 3 when we process projects

-- =========================================================
-- 2) Create workspace KBs for existing projects
-- =========================================================

-- First, create workspace KBs for projects without linked_kb_id
INSERT INTO public.rag_knowledge_bases (name, description, type, is_active, created_at, updated_at)
SELECT 
  p.client_name || ' Workspace' as name,
  'Workspace for ' || p.client_name || ' project' as description,
  'project' as type,
  true as is_active,
  p.created_at,
  p.updated_at
FROM public.projects p
WHERE p.linked_kb_id IS NULL;

-- =========================================================
-- 3) Rename linked_kb_id to kb_id and populate it
-- =========================================================

-- Add new kb_id column (temporarily nullable)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS kb_id UUID;

-- Populate kb_id:
-- - For projects with linked_kb_id: use that KB and update its type to 'project'
-- - For projects without linked_kb_id: use the newly created workspace KB

-- First, update existing KBs that are linked to projects
UPDATE public.rag_knowledge_bases kb
SET type = 'project'
WHERE EXISTS (
  SELECT 1 
  FROM public.projects p 
  WHERE p.linked_kb_id = kb.id
);

-- For projects with linked_kb_id: copy it to kb_id
UPDATE public.projects p
SET kb_id = p.linked_kb_id
WHERE p.linked_kb_id IS NOT NULL;

-- For projects without linked_kb_id: find the newly created workspace KB
UPDATE public.projects p
SET kb_id = (
  SELECT kb.id
  FROM public.rag_knowledge_bases kb
  WHERE kb.name = p.client_name || ' Workspace'
    AND kb.type = 'project'
  ORDER BY kb.created_at DESC
  LIMIT 1
)
WHERE p.kb_id IS NULL;

-- Add foreign key constraint for kb_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'projects'
      AND constraint_name = 'projects_kb_id_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_kb_id_fkey
      FOREIGN KEY (kb_id) REFERENCES public.rag_knowledge_bases(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Make kb_id NOT NULL (all projects should now have a workspace KB)
ALTER TABLE public.projects
  ALTER COLUMN kb_id SET NOT NULL;

-- Drop old linked_kb_id column
ALTER TABLE public.projects
  DROP COLUMN IF EXISTS linked_kb_id;

-- Drop old index if it exists
DROP INDEX IF EXISTS public.idx_projects_linked_kb_id;

-- Create new index on kb_id
CREATE INDEX IF NOT EXISTS idx_projects_kb_id 
  ON public.projects(kb_id);

-- =========================================================
-- 4) Migrate documents from project_id to workspace KBs
-- =========================================================

-- Update documents with project_id to use the project's workspace KB
UPDATE public.rag_documents rd
SET knowledge_base_id = p.kb_id
FROM public.projects p
WHERE rd.project_id = p.id
  AND rd.knowledge_base_id IS NULL;

-- For documents that have both project_id and knowledge_base_id, 
-- we'll keep the knowledge_base_id (assume it's correct)
-- But if knowledge_base_id is NULL, use the project's workspace KB
-- (handled above)

-- Drop the constraint that allowed either kb_id or project_id
ALTER TABLE public.rag_documents
  DROP CONSTRAINT IF EXISTS rag_documents_kb_or_project_check;

-- Make knowledge_base_id NOT NULL again (all documents must belong to a KB)
ALTER TABLE public.rag_documents
  ALTER COLUMN knowledge_base_id SET NOT NULL;

-- Drop foreign key constraint for project_id
ALTER TABLE public.rag_documents
  DROP CONSTRAINT IF EXISTS rag_documents_project_id_fkey;

-- Drop index on project_id
DROP INDEX IF EXISTS public.idx_rag_documents_project_id;

-- Drop project_id column
ALTER TABLE public.rag_documents
  DROP COLUMN IF EXISTS project_id;

-- =========================================================
-- 5) Migrate runs from project_id to workspace KBs
-- =========================================================

-- Update runs with project_id to use the project's workspace KB
-- Note: runs already have knowledge_base_id, so we need to update it
UPDATE public.rag_runs rr
SET knowledge_base_id = p.kb_id
FROM public.projects p
WHERE rr.project_id = p.id;

-- Drop foreign key constraint for project_id
ALTER TABLE public.rag_runs
  DROP CONSTRAINT IF EXISTS rag_runs_project_id_fkey;

-- Drop index on project_id
DROP INDEX IF EXISTS public.idx_rag_runs_project_id;

-- Drop project_id column
ALTER TABLE public.rag_runs
  DROP COLUMN IF EXISTS project_id;

-- =========================================================
-- 6) Cleanup and verification
-- =========================================================

-- Verify all projects have kb_id
DO $$
DECLARE
  projects_without_kb INTEGER;
BEGIN
  SELECT COUNT(*) INTO projects_without_kb
  FROM public.projects
  WHERE kb_id IS NULL;
  
  IF projects_without_kb > 0 THEN
    RAISE EXCEPTION 'Migration failed: % projects still have NULL kb_id', projects_without_kb;
  END IF;
END $$;

-- Verify all documents have knowledge_base_id
DO $$
DECLARE
  docs_without_kb INTEGER;
BEGIN
  SELECT COUNT(*) INTO docs_without_kb
  FROM public.rag_documents
  WHERE knowledge_base_id IS NULL;
  
  IF docs_without_kb > 0 THEN
    RAISE EXCEPTION 'Migration failed: % documents still have NULL knowledge_base_id', docs_without_kb;
  END IF;
END $$;

-- Note: We keep the project_documents junction table unchanged
-- It continues to link projects to documents from OTHER KBs (research)

