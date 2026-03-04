-- Fix ambiguous column reference in match_chunks_for_project function
-- This migration ensures the function uses proper table aliases to avoid ambiguity

CREATE OR REPLACE FUNCTION public.match_chunks_for_project(
  p_project_id UUID,
  p_query_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.5,
  p_match_count INT DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  document_id UUID,
  similarity_score FLOAT,
  document_title TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_kb_id UUID;
BEGIN
  -- Get project's workspace KB ID
  SELECT kb_id INTO v_kb_id
  FROM public.projects
  WHERE projects.id = p_project_id;

  -- If project not found or no KB, return empty
  IF v_kb_id IS NULL THEN
    RETURN;
  END IF;

  -- Search chunks across all project documents (workspace + linked)
  RETURN QUERY
  WITH project_docs AS (
    SELECT DISTINCT rag_docs.id as doc_id
    FROM public.rag_documents rag_docs
    LEFT JOIN public.project_documents proj_docs ON rag_docs.id = proj_docs.document_id AND proj_docs.project_id = p_project_id
    WHERE (
      -- Workspace documents (documents in project's KB)
      (rag_docs.knowledge_base_id = v_kb_id AND rag_docs.deleted_at IS NULL)
      OR
      -- Linked documents (via junction table)
      (proj_docs.project_id = p_project_id AND rag_docs.deleted_at IS NULL)
    )
  )
  SELECT
    chunks.id,
    chunks.content,
    chunks.document_id,
    1 - (chunks.embedding <-> p_query_embedding)::FLOAT as similarity_score,
    COALESCE(docs.title, 'Untitled Document')::TEXT as document_title
  FROM public.rag_chunks chunks
  INNER JOIN public.rag_documents docs ON chunks.document_id = docs.id
  INNER JOIN project_docs pdocs ON docs.id = pdocs.doc_id
  WHERE chunks.embedding IS NOT NULL
    AND (1 - (chunks.embedding <-> p_query_embedding)) >= p_match_threshold
  ORDER BY chunks.embedding <-> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.match_chunks_for_project(UUID, vector(1536), FLOAT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_chunks_for_project(UUID, vector(1536), FLOAT, INT) TO service_role;

