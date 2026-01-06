-- =========================================================
-- Create Research Documents Junction Table
-- =========================================================
-- This migration creates the research_documents junction table
-- to link research subjects to documents (many-to-many relationship)
-- =========================================================

-- =========================================================
-- 1) Create research_documents junction table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.research_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_subject_id UUID NOT NULL REFERENCES public.research_subjects(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.rag_documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(research_subject_id, document_id)
);

-- =========================================================
-- 2) Create indexes for performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_research_documents_research_subject_id 
  ON public.research_documents(research_subject_id);
CREATE INDEX IF NOT EXISTS idx_research_documents_document_id 
  ON public.research_documents(document_id);

-- =========================================================
-- 3) Enable RLS
-- =========================================================
ALTER TABLE public.research_documents ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 4) RLS Policies
-- =========================================================
-- Public can view research_documents
CREATE POLICY "Public can view research_documents"
  ON public.research_documents
  FOR SELECT
  USING (true);

-- Authenticated users can insert research_documents
CREATE POLICY "Authenticated users can insert research_documents"
  ON public.research_documents
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update research_documents
CREATE POLICY "Authenticated users can update research_documents"
  ON public.research_documents
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete research_documents
CREATE POLICY "Authenticated users can delete research_documents"
  ON public.research_documents
  FOR DELETE
  USING (auth.role() = 'authenticated');

