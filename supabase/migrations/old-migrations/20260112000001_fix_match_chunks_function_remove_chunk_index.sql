-- Fix match_chunks function to remove chunk_index column reference
-- The chunk_index column was removed in migration 20251227030000_simplify_rag_chunks_for_vector_stores.sql

CREATE OR REPLACE FUNCTION public.match_chunks(
  p_document_id UUID,
  p_query_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.5,
  p_match_count INT DEFAULT 10
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
  RETURN QUERY
  SELECT
    c.id,
    c.content,
    c.document_id,
    1 - (c.embedding <-> p_query_embedding)::FLOAT as similarity_score,
    COALESCE(d.title, '')::TEXT as document_title
  FROM public.rag_chunks c
  JOIN public.rag_documents d ON c.document_id = d.id
  WHERE c.document_id = p_document_id
    AND c.embedding IS NOT NULL
    AND (1 - (c.embedding <-> p_query_embedding)) >= p_match_threshold
  ORDER BY c.embedding <-> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.match_chunks(UUID, vector(1536), FLOAT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_chunks(UUID, vector(1536), FLOAT, INT) TO service_role;

