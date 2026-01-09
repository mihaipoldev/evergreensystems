/**
 * RAG Service for document-specific chat
 * Handles embedding generation and vector similarity search
 */

import { createClient } from '@/lib/supabase/server';

export interface ChunkResult {
  id: string;
  content: string;
  document_id: string;
  similarity_score: number;
  document_title?: string;
}

/**
 * Generate query embedding using OpenAI API
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI embeddings API error: ${errorData}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Retrieve relevant chunks for a document using vector similarity search
 * Uses a database function for efficient vector similarity search
 */
export async function retrieveRelevantChunks(
  documentId: string,
  queryEmbedding: number[],
  limit: number = 10
): Promise<ChunkResult[]> {
  // Try regular client first to respect RLS
  const { createClient } = await import('@/lib/supabase/server');
  let supabase = await createClient();

  // Convert embedding array to PostgreSQL vector format string
  // Format: '[0.1,0.2,0.3,...]'
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  // Call the database function for vector similarity search
  const { data, error } = await (supabase.rpc as any)('match_chunks', {
    p_document_id: documentId,
    p_query_embedding: embeddingString,
    p_match_threshold: 0.5, // Minimum similarity threshold (0-1)
    p_match_count: limit,
  });

  if (error) {
    // If RLS blocks or function doesn't exist, try service role client
    console.warn('Vector similarity search failed with regular client, trying service role:', error);
    
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const serviceSupabase = createServiceRoleClient();
    
    // Try again with service role client
    const { data: serviceData, error: serviceError } = await (serviceSupabase.rpc as any)('match_chunks', {
      p_document_id: documentId,
      p_query_embedding: embeddingString,
      p_match_threshold: 0.5,
      p_match_count: limit,
    });

    if (!serviceError && serviceData) {
      return (serviceData || []).map((chunk: any) => ({
        id: chunk.id,
        content: chunk.content,
        document_id: chunk.document_id,
        similarity_score: chunk.similarity_score || 0,
        document_title: chunk.document_title || null,
      }));
    }

    // Final fallback: basic retrieval without similarity
    console.warn('Vector similarity search completely failed, using basic retrieval');
    const { data: chunks, error: fetchError } = await (serviceSupabase
      .from('rag_chunks') as any)
      .select(`
        id,
        content,
        document_id,
        rag_documents!inner(
          id,
          title
        )
      `)
      .eq('document_id', documentId)
      .not('embedding', 'is', null)
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to retrieve chunks: ${fetchError.message}`);
    }

    if (!chunks || chunks.length === 0) {
      return [];
    }

    // Return chunks without similarity score (fallback mode)
    return chunks.map((chunk: any) => ({
      id: chunk.id,
      content: chunk.content,
      document_id: chunk.document_id,
      similarity_score: 0.8, // Default score when similarity can't be calculated
      document_title: chunk.rag_documents?.title || null,
    }));
  }

  // Map the results to ChunkResult format
  return (data || []).map((chunk: any) => ({
    id: chunk.id,
    content: chunk.content,
    document_id: chunk.document_id,
    similarity_score: chunk.similarity_score || 0,
    document_title: chunk.document_title || null,
  }));
}

/**
 * Retrieve relevant chunks for a project using vector similarity search across all project documents
 * Searches both workspace documents (from project KB) and linked documents (via project_documents junction)
 */
export async function retrieveRelevantChunksForProject(
  projectId: string,
  queryEmbedding: number[],
  limit: number = 15
): Promise<ChunkResult[]> {
  // Try regular client first to respect RLS
  const { createClient } = await import('@/lib/supabase/server');
  let supabase = await createClient();

  // Convert embedding array to PostgreSQL vector format string
  // Format: '[0.1,0.2,0.3,...]'
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  // Call the database function for vector similarity search across project documents
  const { data, error } = await (supabase.rpc as any)('match_chunks_for_project', {
    p_project_id: projectId,
    p_query_embedding: embeddingString,
    p_match_threshold: 0.5, // Minimum similarity threshold (0-1)
    p_match_count: limit,
  });

  if (error) {
    // If RLS blocks or function doesn't exist, try service role client
    console.warn('Project vector similarity search failed with regular client, trying service role:', error);
    
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const serviceSupabase = createServiceRoleClient();
    
    // Try again with service role client
    const { data: serviceData, error: serviceError } = await (serviceSupabase.rpc as any)('match_chunks_for_project', {
      p_project_id: projectId,
      p_query_embedding: embeddingString,
      p_match_threshold: 0.5,
      p_match_count: limit,
    });

    if (!serviceError && serviceData) {
      return (serviceData || []).map((chunk: any) => ({
        id: chunk.id,
        content: chunk.content,
        document_id: chunk.document_id,
        similarity_score: chunk.similarity_score || 0,
        document_title: chunk.document_title || null,
      }));
    }

    // Final fallback: basic retrieval without similarity
    // Get all project documents first, then retrieve chunks from each
    console.warn('Project vector similarity search completely failed, using basic retrieval');
    
    // Get project KB ID
    const { data: project, error: projectError } = await (serviceSupabase
      .from('projects') as any)
      .select('kb_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Failed to find project: ${projectError?.message || 'Project not found'}`);
    }

    // Get all project documents (workspace + linked)
    const { data: workspaceDocs } = await (serviceSupabase
      .from('rag_documents') as any)
      .select('id')
      .eq('knowledge_base_id', project.kb_id)
      .is('deleted_at', null);

    const { data: linkedDocs } = await (serviceSupabase
      .from('project_documents') as any)
      .select('document_id')
      .eq('project_id', projectId);

    const allDocIds = [
      ...(workspaceDocs || []).map((d: any) => d.id),
      ...(linkedDocs || []).map((d: any) => d.document_id),
    ];

    if (allDocIds.length === 0) {
      return [];
    }

    // Retrieve chunks from all documents (limit per document to avoid too many results)
    const chunksPerDoc = Math.ceil(limit / allDocIds.length);
    const { data: chunks, error: fetchError } = await (serviceSupabase
      .from('rag_chunks') as any)
      .select(`
        id,
        content,
        document_id,
        rag_documents!inner(
          id,
          title
        )
      `)
      .in('document_id', allDocIds)
      .not('embedding', 'is', null)
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to retrieve project chunks: ${fetchError.message}`);
    }

    if (!chunks || chunks.length === 0) {
      return [];
    }

    // Return chunks without similarity score (fallback mode)
    return chunks.map((chunk: any) => ({
      id: chunk.id,
      content: chunk.content,
      document_id: chunk.document_id,
      similarity_score: 0.8, // Default score when similarity can't be calculated
      document_title: chunk.rag_documents?.title || null,
    }));
  }

  // Map the results to ChunkResult format
  return (data || []).map((chunk: any) => ({
    id: chunk.id,
    content: chunk.content,
    document_id: chunk.document_id,
    similarity_score: chunk.similarity_score || 0,
    document_title: chunk.document_title || null,
  }));
}


/**
 * Retrieve relevant chunks for a knowledge base using vector similarity search across all KB documents
 * Searches all documents in the knowledge base (simpler than projects - no junction table)
 */
export async function retrieveRelevantChunksForKnowledgeBase(
  knowledgeBaseId: string,
  queryEmbedding: number[],
  limit: number = 15
): Promise<ChunkResult[]> {
  const { createClient, createServiceRoleClient } = await import('@/lib/supabase/server');
  let supabase = await createClient();
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  let data, error;

  try {
    ({ data, error } = await (supabase.rpc as any)('match_chunks_for_knowledge_base', {
      p_kb_id: knowledgeBaseId,
      p_query_embedding: embeddingString,
      p_match_threshold: 0.5,
      p_match_count: limit,
    }));
  } catch (rpcError) {
    console.warn('KB vector similarity search failed with regular client, trying service role:', rpcError);
    error = rpcError;
  }

  if (error) {
    const serviceSupabase = createServiceRoleClient();
    try {
      ({ data, error } = await (serviceSupabase.rpc as any)('match_chunks_for_knowledge_base', {
        p_kb_id: knowledgeBaseId,
        p_query_embedding: embeddingString,
        p_match_threshold: 0.5,
        p_match_count: limit,
      }));
    } catch (serviceRpcError) {
      console.warn('KB vector similarity search completely failed, using basic retrieval:', serviceRpcError);
      error = serviceRpcError;
    }

    if (error) {
      // Fallback to basic retrieval if RPC fails completely
      const { data: kbDocs, error: docsError } = await (serviceSupabase
        .from('rag_documents') as any)
        .select('id')
        .eq('knowledge_base_id', knowledgeBaseId)
        .is('deleted_at', null)
        .gt('chunk_count', 0);

      if (docsError) {
        throw new Error(`Failed to find KB documents: ${docsError.message}`);
      }

      if (!kbDocs || kbDocs.length === 0) {
        return [];
      }

      const docIds = kbDocs.map((d: any) => d.id);

      const { data: chunks, error: fetchError } = await (serviceSupabase
        .from('rag_chunks') as any)
        .select(`
          id,
          content,
          document_id,
          rag_documents!inner(
            id,
            title
          )
        `)
        .in('document_id', docIds)
        .not('embedding', 'is', null)
        .limit(limit);

      if (fetchError) {
        throw new Error(`Failed to retrieve KB chunks: ${fetchError.message}`);
      }

      if (!chunks || chunks.length === 0) {
        return [];
      }

      return chunks.map((chunk: any) => ({
        id: chunk.id,
        content: chunk.content,
        document_id: chunk.document_id,
        similarity_score: 0.8,
        document_title: chunk.rag_documents?.title || null,
      }));
    }
  }

  return (data || []).map((chunk: any) => ({
    id: chunk.id,
    content: chunk.content,
    document_id: chunk.document_id,
    similarity_score: chunk.similarity_score || 0,
    document_title: chunk.document_title || null,
  }));
}

/**
 * Retrieve relevant chunks for multiple contexts using vector similarity search
 * Aggregates chunks from all contexts, deduplicates, and sorts by similarity score
 */
export async function retrieveRelevantChunksForMultipleContexts(
  contexts: Array<{ type: 'document' | 'project' | 'knowledgeBase'; id: string }>,
  queryEmbedding: number[],
  limit: number = 20
): Promise<ChunkResult[]> {
  if (contexts.length === 0) {
    return [];
  }

  // Calculate limit per context (distribute evenly, with minimum 5 per context)
  const limitPerContext = Math.max(5, Math.ceil(limit / contexts.length));

  // Fetch chunks from all contexts in parallel
  const chunkPromises = contexts.map(async (context) => {
    try {
      switch (context.type) {
        case 'document':
          return await retrieveRelevantChunks(context.id, queryEmbedding, limitPerContext);
        case 'project':
          return await retrieveRelevantChunksForProject(context.id, queryEmbedding, limitPerContext);
        case 'knowledgeBase':
          return await retrieveRelevantChunksForKnowledgeBase(context.id, queryEmbedding, limitPerContext);
        default:
          console.warn(`Unknown context type: ${context.type}`);
          return [];
      }
    } catch (error) {
      console.error(`Error retrieving chunks for ${context.type} ${context.id}:`, error);
      return [];
    }
  });

  const chunkArrays = await Promise.all(chunkPromises);

  // Flatten and aggregate all chunks
  const allChunks: ChunkResult[] = [];
  for (const chunks of chunkArrays) {
    allChunks.push(...chunks);
  }

  // Deduplicate chunks by document_id and content hash (simple approach: by id)
  const seen = new Set<string>();
  const uniqueChunks: ChunkResult[] = [];

  for (const chunk of allChunks) {
    // Use chunk id as deduplication key (since same chunk might appear from different contexts)
    if (!seen.has(chunk.id)) {
      seen.add(chunk.id);
      uniqueChunks.push(chunk);
    }
  }

  // Sort by similarity score (highest first)
  uniqueChunks.sort((a, b) => b.similarity_score - a.similarity_score);

  // Return top N chunks
  return uniqueChunks.slice(0, limit);
}
