-- =========================================================
-- Add Projects Support to RAG System
-- =========================================================
-- This migration adds Projects as a new organizational unit for client work,
-- allowing documents and runs to be associated with projects instead of
-- (or in addition to) knowledge bases.
--
-- Changes:
-- 1. Create projects table
-- 2. Modify rag_documents: add project_id, run_id, file metadata; remove old columns
-- 3. Modify rag_runs: add project_id
-- 4. Modify rag_run_outputs: add markdown_storage_path
-- 5. Create project_documents junction table
-- 6. Delete rag_document_sections table (no longer needed)
-- =========================================================

-- =========================================================
-- 1) Create projects table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'onboarding', 'delivered', 'archived')),
  linked_kb_id UUID REFERENCES public.rag_knowledge_bases(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  archived_at TIMESTAMPTZ
);

-- Verify projects table was created successfully
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
  ) THEN
    RAISE EXCEPTION 'Failed to create projects table';
  END IF;
END $$;

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_linked_kb_id ON public.projects(linked_kb_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- Add updated_at trigger for projects
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 2) Modify rag_documents table
-- =========================================================

-- Add new columns (without foreign key constraints first)
ALTER TABLE public.rag_documents
  ADD COLUMN IF NOT EXISTS project_id UUID,
  ADD COLUMN IF NOT EXISTS run_id UUID,
  ADD COLUMN IF NOT EXISTS should_chunk BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Add foreign key constraints separately (only if they don't exist)
DO $$
BEGIN
  -- Add project_id foreign key if column exists, constraint doesn't, and projects table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rag_documents' 
    AND column_name = 'project_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND table_name = 'rag_documents' 
    AND constraint_name = 'rag_documents_project_id_fkey'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE public.rag_documents
      ADD CONSTRAINT rag_documents_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;

  -- Add run_id foreign key if column exists and constraint doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rag_documents' 
    AND column_name = 'run_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND table_name = 'rag_documents' 
    AND constraint_name = 'rag_documents_run_id_fkey'
  ) THEN
    ALTER TABLE public.rag_documents
      ADD CONSTRAINT rag_documents_run_id_fkey
      FOREIGN KEY (run_id) REFERENCES public.rag_runs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Make knowledge_base_id nullable (documents can belong to projects instead)
ALTER TABLE public.rag_documents
  ALTER COLUMN knowledge_base_id DROP NOT NULL;

-- Remove old columns (safe with IF EXISTS)
ALTER TABLE public.rag_documents
  DROP COLUMN IF EXISTS embedding_count,
  DROP COLUMN IF EXISTS notion_page_id,
  DROP COLUMN IF EXISTS drive_file_id;

-- Drop old indexes that reference removed columns
DROP INDEX IF EXISTS public.rag_documents_notion_page_id_idx;
DROP INDEX IF EXISTS public.rag_documents_drive_file_id_idx;
DROP INDEX IF EXISTS public.rag_documents_kb_notion_page_id_uq;
DROP INDEX IF EXISTS public.rag_documents_kb_drive_file_id_uq;

-- Add new indexes
CREATE INDEX IF NOT EXISTS idx_rag_documents_project_id ON public.rag_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_run_id ON public.rag_documents(run_id);

-- Add constraint: Document must have either kb_id OR project_id (but not both),
-- unless run_id is set (in which case both can be present)
ALTER TABLE public.rag_documents
  DROP CONSTRAINT IF EXISTS rag_documents_kb_or_project_check;

ALTER TABLE public.rag_documents
  ADD CONSTRAINT rag_documents_kb_or_project_check
  CHECK (
    -- If run_id is set, both kb_id and project_id can be present
    (run_id IS NOT NULL)
    OR
    -- If run_id is NULL, must have either kb_id OR project_id (but not both)
    (
      (knowledge_base_id IS NULL AND project_id IS NOT NULL)
      OR
      (knowledge_base_id IS NOT NULL AND project_id IS NULL)
    )
  );

-- =========================================================
-- 3) Modify rag_runs table
-- =========================================================

-- Add project_id column (without foreign key first)
ALTER TABLE public.rag_runs
  ADD COLUMN IF NOT EXISTS project_id UUID;

-- Add foreign key constraint separately
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'rag_runs' 
    AND column_name = 'project_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND table_name = 'rag_runs' 
    AND constraint_name = 'rag_runs_project_id_fkey'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE public.rag_runs
      ADD CONSTRAINT rag_runs_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for project_id
CREATE INDEX IF NOT EXISTS idx_rag_runs_project_id ON public.rag_runs(project_id);

-- =========================================================
-- 4) Modify rag_run_outputs table
-- =========================================================

-- Add markdown_storage_path column
ALTER TABLE public.rag_run_outputs
  ADD COLUMN IF NOT EXISTS markdown_storage_path TEXT;

-- =========================================================
-- 5) Create project_documents junction table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, document_id)
);

-- Create indexes for project_documents
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON public.project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_document_id ON public.project_documents(document_id);

-- =========================================================
-- 6) Delete rag_document_sections table
-- =========================================================

-- Drop RLS policies first
DROP POLICY IF EXISTS "rag_sections_select_via_kb" ON public.rag_document_sections;
DROP POLICY IF EXISTS "rag_sections_write_via_kb" ON public.rag_document_sections;

-- Drop indexes
DROP INDEX IF EXISTS public.rag_document_sections_doc_section_index_uq;
DROP INDEX IF EXISTS public.rag_document_sections_kb_doc_idx;

-- Drop the table
DROP TABLE IF EXISTS public.rag_document_sections;

