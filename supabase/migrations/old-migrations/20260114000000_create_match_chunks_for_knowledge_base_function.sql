-- Create function for vector similarity search across all knowledge base documents
-- This function searches chunks from all documents in a knowledge base
-- Returns top matching chunks across all documents with document context

CREATE OR REPLACE FUNCTION public.match_chunks_for_knowledge_base(
  p_kb_id UUID,
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
BEGIN
  -- Search chunks across all documents in the knowledge base
  RETURN QUERY
  SELECT
    c.id,
    c.content,
    c.document_id,
    1 - (c.embedding <-> p_query_embedding)::FLOAT as similarity_score,
    COALESCE(d.title, 'Untitled Document')::TEXT as document_title
  FROM public.rag_chunks c
  INNER JOIN public.rag_documents d ON c.document_id = d.id
  WHERE d.knowledge_base_id = p_kb_id
    AND d.deleted_at IS NULL
    AND c.embedding IS NOT NULL
    AND (1 - (c.embedding <-> p_query_embedding)) >= p_match_threshold
  ORDER BY c.embedding <-> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.match_chunks_for_knowledge_base(UUID, vector(1536), FLOAT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_chunks_for_knowledge_base(UUID, vector(1536), FLOAT, INT) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.match_chunks_for_knowledge_base(UUID, vector(1536), FLOAT, INT) IS 
'Returns relevant chunks from all documents in a knowledge base. Searches across all documents in the KB and returns top matching chunks with document context.';

