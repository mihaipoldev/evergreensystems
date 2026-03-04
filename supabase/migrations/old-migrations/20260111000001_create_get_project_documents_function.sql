-- ============================================================================
-- PostgreSQL Function: get_project_documents
-- Optimized function to fetch all documents for a project (workspace + linked)
-- This replaces multiple queries with a single efficient query
-- ============================================================================

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS get_project_documents(UUID, UUID);

-- Create function to get all project documents
CREATE OR REPLACE FUNCTION get_project_documents(
  project_id_param UUID,
  kb_id_param UUID
)
RETURNS TABLE (
  id UUID,
  knowledge_base_id UUID,
  name TEXT,
  status TEXT,
  chunk_count INTEGER,
  content_hash TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size BIGINT,
  mime_type TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  should_chunk BOOLEAN,
  project_id UUID,
  run_id UUID,
  knowledge_base_name TEXT,
  is_workspace_document BOOLEAN
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  -- Use DISTINCT ON to handle duplicates (workspace docs take precedence)
  SELECT DISTINCT ON (d.id)
    d.id,
    d.knowledge_base_id,
    d.name,
    d.status,
    d.chunk_count,
    d.content_hash,
    d.file_path,
    d.file_type,
    d.file_size,
    d.mime_type,
    d.storage_path,
    d.created_at,
    d.updated_at,
    d.deleted_at,
    d.should_chunk,
    d.project_id,
    d.run_id,
    COALESCE(kb.name, linked_kb.name) as knowledge_base_name,
    CASE 
      WHEN d.knowledge_base_id = kb_id_param AND pd.id IS NULL THEN true
      ELSE false
    END as is_workspace_document
  FROM rag_documents d
  -- Join for workspace KB name
  LEFT JOIN rag_knowledge_bases kb ON d.knowledge_base_id = kb.id
  -- Join for linked documents via junction table
  LEFT JOIN project_documents pd ON d.id = pd.document_id AND pd.project_id = project_id_param
  -- Join for linked document KB name
  LEFT JOIN rag_knowledge_bases linked_kb ON pd.document_id = d.id AND d.knowledge_base_id = linked_kb.id
  WHERE (
    -- Workspace documents (documents in project's KB)
    (d.knowledge_base_id = kb_id_param AND d.deleted_at IS NULL)
    OR
    -- Linked documents (via junction table)
    (pd.project_id = project_id_param AND d.deleted_at IS NULL)
  )
  -- Order by created_at DESC for consistent sorting
  -- DISTINCT ON ensures workspace docs come first when there's a duplicate
  ORDER BY d.id, 
    CASE WHEN d.knowledge_base_id = kb_id_param AND pd.id IS NULL THEN 0 ELSE 1 END,
    d.created_at DESC;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_project_documents(UUID, UUID) IS 
'Returns all documents for a project: workspace documents (from project KB) and linked documents (via project_documents junction table). Uses DISTINCT ON to handle duplicates with workspace docs taking precedence.';




