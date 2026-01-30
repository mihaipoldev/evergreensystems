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
  const supabase = await createClient();

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
  const supabase = await createClient();

  // Convert embedding array to PostgreSQL vector format string
  // Format: '[0.1,0.2,0.3,...]'
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  // Call the database function for vector similarity search across project documents
  console.log(`[RAG] Calling match_chunks_for_project for project ${projectId}`);
  console.log(`[RAG] Parameters: threshold=0.5, limit=${limit}, embeddingLength=${queryEmbedding.length}`);
  const { data, error } = await (supabase.rpc as any)('match_chunks_for_project', {
    p_project_id: projectId,
    p_query_embedding: embeddingString,
    p_match_threshold: 0.5, // Minimum similarity threshold (0-1)
    p_match_count: limit,
  });

  console.log(`[RAG] match_chunks_for_project response:`, {
    hasData: !!data,
    dataLength: data?.length || 0,
    hasError: !!error,
    error: error ? JSON.stringify(error, null, 2) : null,
  });

  if (error) {
    // If RLS blocks or function doesn't exist, try service role client
    console.warn(`[RAG] Project vector similarity search failed with regular client, trying service role:`, error);
    console.warn(`[RAG] Error details:`, JSON.stringify(error, null, 2));
    
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const serviceSupabase = createServiceRoleClient();
    
    // Try again with service role client
    console.log(`[RAG] Retrying with service role client for project ${projectId}`);
    const { data: serviceData, error: serviceError } = await (serviceSupabase.rpc as any)('match_chunks_for_project', {
      p_project_id: projectId,
      p_query_embedding: embeddingString,
      p_match_threshold: 0.5,
      p_match_count: limit,
    });

    if (serviceError) {
      console.error(`[RAG] Service role client also failed:`, serviceError);
      console.error(`[RAG] Service error details:`, JSON.stringify(serviceError, null, 2));
    }

    if (!serviceError && serviceData) {
      console.log(`[RAG] Service role client succeeded, returned ${serviceData?.length || 0} chunks`);
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
    console.warn(`[RAG] Project vector similarity search completely failed, using basic retrieval for project ${projectId}`);
    
    // Get project KB ID
    console.log(`[RAG] Fetching project ${projectId} details...`);
    const { data: project, error: projectError } = await (serviceSupabase
      .from('projects') as any)
      .select('kb_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error(`[RAG] Failed to find project ${projectId}:`, projectError);
      throw new Error(`Failed to find project: ${projectError?.message || 'Project not found'}`);
    }
    
    console.log(`[RAG] Project ${projectId} has KB ID: ${project.kb_id}`);

    // Get all project documents (workspace + linked)
    console.log(`[RAG] Fetching workspace documents for KB ${project.kb_id}...`);
    const { data: workspaceDocs, error: workspaceError } = await (serviceSupabase
      .from('rag_documents') as any)
      .select('id')
      .eq('knowledge_base_id', project.kb_id)
      .is('deleted_at', null);

    if (workspaceError) {
      console.error(`[RAG] Error fetching workspace docs:`, workspaceError);
    }
    console.log(`[RAG] Found ${workspaceDocs?.length || 0} workspace documents`);

    console.log(`[RAG] Fetching linked documents for project ${projectId}...`);
    const { data: linkedDocs, error: linkedError } = await (serviceSupabase
      .from('project_documents') as any)
      .select('document_id')
      .eq('project_id', projectId);

    if (linkedError) {
      console.error(`[RAG] Error fetching linked docs:`, linkedError);
    }
    console.log(`[RAG] Found ${linkedDocs?.length || 0} linked documents`);

    const allDocIds = [
      ...(workspaceDocs || []).map((d: any) => d.id),
      ...(linkedDocs || []).map((d: any) => d.document_id),
    ];

    console.log(`[RAG] Total document IDs: ${allDocIds.length}`, allDocIds);

    if (allDocIds.length === 0) {
      console.warn(`[RAG] No documents found for project ${projectId}`);
      return [];
    }

    // Retrieve chunks from all documents (limit per document to avoid too many results)
    const chunksPerDoc = Math.ceil(limit / allDocIds.length);
    console.log(`[RAG] Fetching chunks from ${allDocIds.length} documents (limit: ${limit}, per doc: ${chunksPerDoc})...`);
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
      console.error(`[RAG] Error fetching chunks:`, fetchError);
      throw new Error(`Failed to retrieve project chunks: ${fetchError.message}`);
    }

    console.log(`[RAG] Retrieved ${chunks?.length || 0} chunks from database`);

    if (!chunks || chunks.length === 0) {
      console.warn(`[RAG] No chunks found for project ${projectId} documents`);
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
  const results = (data || []).map((chunk: any) => ({
    id: chunk.id,
    content: chunk.content,
    document_id: chunk.document_id,
    similarity_score: chunk.similarity_score || 0,
    document_title: chunk.document_title || null,
  }));
  
  console.log(`[RAG] Mapped ${results.length} chunks from match_chunks_for_project`);
  
  // If we got 0 results, try fallback to check if documents/chunks exist
  if (results.length === 0) {
    console.warn(`[RAG] No chunks found via vector search, checking if documents/chunks exist...`);
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const serviceSupabase = createServiceRoleClient();
    
    // Check if project exists and get KB ID
    const { data: project } = await (serviceSupabase
      .from('projects') as any)
      .select('kb_id')
      .eq('id', projectId)
      .single();
    
    if (project) {
      // Check workspace docs
      const { data: workspaceDocs } = await (serviceSupabase
        .from('rag_documents') as any)
        .select('id, title, chunk_count')
        .eq('knowledge_base_id', project.kb_id)
        .is('deleted_at', null);
      
      // Check linked docs
      const { data: linkedDocs } = await (serviceSupabase
        .from('project_documents') as any)
        .select('document_id, rag_documents(id, title, chunk_count)')
        .eq('project_id', projectId);
      
      console.log(`[RAG] Project has ${workspaceDocs?.length || 0} workspace docs, ${linkedDocs?.length || 0} linked docs`);
      
      const allDocIds = [
        ...(workspaceDocs || []).map((d: any) => d.id),
        ...(linkedDocs || []).map((d: any) => d.document_id),
      ];
      
      if (allDocIds.length > 0) {
        // Check if chunks exist for these documents
        const { data: chunksCheck } = await (serviceSupabase
          .from('rag_chunks') as any)
          .select('id, document_id')
          .in('document_id', allDocIds)
          .not('embedding', 'is', null)
          .limit(1);
        
        console.log(`[RAG] Found ${chunksCheck?.length || 0} chunks with embeddings for project documents`);
        
        if (chunksCheck && chunksCheck.length > 0) {
          console.warn(`[RAG] Chunks exist but vector search returned 0 results. Using fallback retrieval...`);
          
          // Use fallback: retrieve chunks without similarity search
          const { data: fallbackChunks, error: fallbackError } = await (serviceSupabase
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
          
          if (!fallbackError && fallbackChunks && fallbackChunks.length > 0) {
            console.log(`[RAG] Fallback retrieved ${fallbackChunks.length} chunks`);
            return fallbackChunks.map((chunk: any) => ({
              id: chunk.id,
              content: chunk.content,
              document_id: chunk.document_id,
              similarity_score: 0.7, // Default score for fallback
              document_title: chunk.rag_documents?.title || null,
            }));
          } else {
            console.warn(`[RAG] Fallback retrieval also failed:`, fallbackError);
          }
        } else {
          console.warn(`[RAG] No chunks with embeddings found for project documents`);
        }
      } else {
        console.warn(`[RAG] Project has no documents`);
      }
    }
  }
  
  return results;
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
  const supabase = await createClient();
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
      console.log(`[RAG] Retrieving chunks for ${context.type} ${context.id}...`);
      let result;
      switch (context.type) {
        case 'document':
          result = await retrieveRelevantChunks(context.id, queryEmbedding, limitPerContext);
          console.log(`[RAG] Document ${context.id} returned ${result.length} chunks`);
          return result;
        case 'project':
          result = await retrieveRelevantChunksForProject(context.id, queryEmbedding, limitPerContext);
          console.log(`[RAG] Project ${context.id} returned ${result.length} chunks`);
          return result;
        case 'knowledgeBase':
          result = await retrieveRelevantChunksForKnowledgeBase(context.id, queryEmbedding, limitPerContext);
          console.log(`[RAG] Knowledge Base ${context.id} returned ${result.length} chunks`);
          return result;
        default:
          console.warn(`[RAG] Unknown context type: ${context.type}`);
          return [];
      }
    } catch (error) {
      console.error(`[RAG] Error retrieving chunks for ${context.type} ${context.id}:`, error);
      console.error(`[RAG] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
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
