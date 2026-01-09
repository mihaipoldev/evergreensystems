-- Create function for vector similarity search across all project documents
-- This function searches chunks from both workspace documents and linked documents
-- Returns top matching chunks across all documents with document context

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
  WHERE id = p_project_id;

  -- If project not found or no KB, return empty
  IF v_kb_id IS NULL THEN
    RETURN;
  END IF;

  -- Search chunks across all project documents (workspace + linked)
  RETURN QUERY
  WITH project_docs AS (
    SELECT DISTINCT d.id as doc_id
    FROM public.rag_documents d
    LEFT JOIN public.project_documents pd ON d.id = pd.document_id AND pd.project_id = p_project_id
    WHERE (
      -- Workspace documents (documents in project's KB)
      (d.knowledge_base_id = v_kb_id AND d.deleted_at IS NULL)
      OR
      -- Linked documents (via junction table)
      (pd.project_id = p_project_id AND d.deleted_at IS NULL)
    )
  )
  SELECT
    c.id,
    c.content,
    c.document_id,
    1 - (c.embedding <-> p_query_embedding)::FLOAT as similarity_score,
    COALESCE(d.title, 'Untitled Document')::TEXT as document_title
  FROM public.rag_chunks c
  INNER JOIN public.rag_documents d ON c.document_id = d.id
  INNER JOIN project_docs pdocs ON d.id = pdocs.doc_id
  WHERE c.embedding IS NOT NULL
    AND (1 - (c.embedding <-> p_query_embedding)) >= p_match_threshold
  ORDER BY c.embedding <-> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.match_chunks_for_project(UUID, vector(1536), FLOAT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_chunks_for_project(UUID, vector(1536), FLOAT, INT) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.match_chunks_for_project(UUID, vector(1536), FLOAT, INT) IS 
'Returns relevant chunks from all documents associated with a project (workspace documents from project KB and linked documents via project_documents junction table). Searches across all documents and returns top matching chunks with document context.';

