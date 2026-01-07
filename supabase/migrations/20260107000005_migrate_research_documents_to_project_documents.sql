-- =========================================================
-- Migrate Research Documents to Project Documents
-- =========================================================
-- This migration migrates all research_documents links to
-- project_documents using the mapping table from Step 2.1.
-- This is Phase 2.2 of consolidating research_subjects into projects
-- =========================================================

-- =========================================================
-- 1) Migrate research_documents to project_documents
-- =========================================================
-- Use the mapping table to find corresponding project_id
-- for each research_subject_id, then migrate document links

INSERT INTO public.project_documents (
  project_id,
  document_id,
  created_at
)
SELECT 
  m.project_id,
  rd.document_id,
  rd.created_at
FROM public.research_documents rd
JOIN public.research_subject_to_project_mapping m 
  ON rd.research_subject_id = m.research_subject_id
ON CONFLICT (project_id, document_id) DO NOTHING;

-- =========================================================
-- Note: research_documents table remains intact for parallel
-- operation during migration. It will be dropped in Phase 5 cleanup.

