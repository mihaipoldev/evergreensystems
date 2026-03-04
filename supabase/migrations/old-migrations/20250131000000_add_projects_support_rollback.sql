-- =========================================================
-- Rollback: Remove Projects Support from RAG System
-- =========================================================
-- This migration reverses all changes made in add_projects_support.sql
--
-- Rollback order (reverse of creation):
-- 1. Recreate rag_document_sections table
-- 2. Drop project_documents junction table
-- 3. Remove markdown_storage_path from rag_run_outputs
-- 4. Remove project_id from rag_runs
-- 5. Restore rag_documents to original state
-- 6. Drop projects table
-- =========================================================

-- =========================================================
-- 1) Recreate rag_document_sections table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.rag_document_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES public.rag_knowledge_bases(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
  section_index INT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  token_count INT,
  char_start INT,
  char_end INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rag_document_sections_doc_section_index_uq
  ON public.rag_document_sections (document_id, section_index);

CREATE INDEX IF NOT EXISTS rag_document_sections_kb_doc_idx
  ON public.rag_document_sections (knowledge_base_id, document_id);

-- Re-enable RLS
ALTER TABLE public.rag_document_sections ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
DROP POLICY IF EXISTS "rag_sections_select_via_kb" ON public.rag_document_sections;
CREATE POLICY "rag_sections_select_via_kb"
ON public.rag_document_sections
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rag_knowledge_bases kb
    WHERE kb.id = rag_document_sections.knowledge_base_id
      AND (
        kb.visibility = 'public'
        OR (
          kb.visibility = 'private'
          AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
        )
      )
  )
);

DROP POLICY IF EXISTS "rag_sections_write_via_kb" ON public.rag_document_sections;
CREATE POLICY "rag_sections_write_via_kb"
ON public.rag_document_sections
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rag_knowledge_bases kb
    WHERE kb.id = rag_document_sections.knowledge_base_id
      AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rag_knowledge_bases kb
    WHERE kb.id = rag_document_sections.knowledge_base_id
      AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
  )
);

-- =========================================================
-- 2) Drop project_documents junction table
-- =========================================================
DROP TABLE IF EXISTS public.project_documents;

-- =========================================================
-- 3) Remove markdown_storage_path from rag_run_outputs
-- =========================================================
ALTER TABLE public.rag_run_outputs
  DROP COLUMN IF EXISTS markdown_storage_path;

-- =========================================================
-- 4) Remove project_id from rag_runs
-- =========================================================
DROP INDEX IF EXISTS public.idx_rag_runs_project_id;
-- Drop foreign key constraint first (if it exists)
ALTER TABLE public.rag_runs
  DROP CONSTRAINT IF EXISTS rag_runs_project_id_fkey;
ALTER TABLE public.rag_runs
  DROP COLUMN IF EXISTS project_id;

-- =========================================================
-- 5) Restore rag_documents to original state
-- =========================================================

-- Remove constraint
ALTER TABLE public.rag_documents
  DROP CONSTRAINT IF EXISTS rag_documents_kb_or_project_check;

-- Drop new indexes
DROP INDEX IF EXISTS public.idx_rag_documents_project_id;
DROP INDEX IF EXISTS public.idx_rag_documents_run_id;

-- Drop foreign key constraints first (if they exist)
ALTER TABLE public.rag_documents
  DROP CONSTRAINT IF EXISTS rag_documents_project_id_fkey,
  DROP CONSTRAINT IF EXISTS rag_documents_run_id_fkey;

-- Remove new columns
ALTER TABLE public.rag_documents
  DROP COLUMN IF EXISTS project_id,
  DROP COLUMN IF EXISTS run_id,
  DROP COLUMN IF EXISTS should_chunk,
  DROP COLUMN IF EXISTS file_type,
  DROP COLUMN IF EXISTS file_size,
  DROP COLUMN IF EXISTS mime_type;

-- Restore knowledge_base_id to NOT NULL
-- Note: In a rollback scenario, all existing documents should have knowledge_base_id set
-- If any NULL values exist (shouldn't happen), we need to handle them
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM public.rag_documents
  WHERE knowledge_base_id IS NULL;
  
  IF null_count > 0 THEN
    -- If there are NULL values, try to set them from a default KB
    -- This is a safety measure - in normal rollback, this shouldn't be needed
    UPDATE public.rag_documents
    SET knowledge_base_id = (SELECT id FROM public.rag_knowledge_bases LIMIT 1)
    WHERE knowledge_base_id IS NULL
    AND EXISTS (SELECT 1 FROM public.rag_knowledge_bases LIMIT 1);
  END IF;
END $$;

-- Now make it NOT NULL (will fail if any NULLs remain, which is expected)
ALTER TABLE public.rag_documents
  ALTER COLUMN knowledge_base_id SET NOT NULL;

-- Re-add old columns with defaults
ALTER TABLE public.rag_documents
  ADD COLUMN IF NOT EXISTS embedding_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notion_page_id TEXT,
  ADD COLUMN IF NOT EXISTS drive_file_id TEXT;

-- Recreate old indexes
CREATE INDEX IF NOT EXISTS rag_documents_notion_page_id_idx
  ON public.rag_documents (notion_page_id);

CREATE INDEX IF NOT EXISTS rag_documents_drive_file_id_idx
  ON public.rag_documents (drive_file_id);

CREATE UNIQUE INDEX IF NOT EXISTS rag_documents_kb_notion_page_id_uq
  ON public.rag_documents (knowledge_base_id, notion_page_id)
  WHERE notion_page_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS rag_documents_kb_drive_file_id_uq
  ON public.rag_documents (knowledge_base_id, drive_file_id)
  WHERE drive_file_id IS NOT NULL;

-- =========================================================
-- 6) Drop projects table
-- =========================================================
-- Drop trigger first
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_projects_status;
DROP INDEX IF EXISTS public.idx_projects_linked_kb_id;
DROP INDEX IF EXISTS public.idx_projects_slug;

-- Drop the table
DROP TABLE IF EXISTS public.projects;

