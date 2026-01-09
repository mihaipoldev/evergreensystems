import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/contexts/search?q=query&types=document,project,knowledgeBase
 * Search across documents, projects, and knowledge bases
 * Returns filtered results across all context types
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const typesParam = searchParams.get('types') || 'document,project,knowledgeBase';
    const types = typesParam.split(',').map(t => t.trim());
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    let adminSupabase;
    try {
      adminSupabase = createServiceRoleClient();
    } catch (serviceError) {
      return NextResponse.json(
        { 
          error: 'Failed to initialize database client',
          details: serviceError instanceof Error ? serviceError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    const results: Array<{
      id: string;
      type: 'document' | 'project' | 'knowledgeBase';
      title: string;
      subtitle?: string;
      breadcrumb?: string;
      metadata?: string;
    }> = [];

    // Search documents - OPTIMIZED
    if (types.includes('document')) {
      const documentsQuery = (adminSupabase
        .from('rag_documents') as any)
        .select('id, title, chunk_count, knowledge_base_id, updated_at')
        .is('deleted_at', null)
        .gt('chunk_count', 0)
        .order('updated_at', { ascending: false });
      
      if (query.trim()) {
        documentsQuery.ilike('title', `%${query}%`);
      }
      
      const { data: documents } = await documentsQuery.limit(100);

      if (documents && documents.length > 0) {
        // Get KB names for breadcrumbs in parallel
        const kbIds = [...new Set(documents.map((d: any) => d.knowledge_base_id).filter(Boolean))];
        const kbMap = new Map<string, string>();
        if (kbIds.length > 0) {
          const { data: kbs } = await (adminSupabase
            .from('rag_knowledge_bases') as any)
            .select('id, name')
            .in('id', kbIds);

          if (kbs) {
            kbs.forEach((kb: any) => kbMap.set(kb.id, kb.name));
          }
        }

        documents.forEach((doc: any) => {
          const kbName = kbMap.get(doc.knowledge_base_id);
          results.push({
            id: doc.id,
            type: 'document',
            title: doc.title || 'Untitled Document',
            subtitle: `${doc.chunk_count || 0} chunks`,
            breadcrumb: kbName ? `Knowledge Base: ${kbName}` : undefined,
            metadata: `${doc.chunk_count || 0} chunks`,
          });
        });
      }
    }

    // Search projects - OPTIMIZED with parallel queries
    if (types.includes('project')) {
      const projectsQuery = (adminSupabase
        .from('projects') as any)
        .select('id, client_name, description, kb_id, status, updated_at')
        .is('archived_at', null)
        .order('updated_at', { ascending: false });
      
      if (query.trim()) {
        projectsQuery.ilike('client_name', `%${query}%`);
      }
      
      const { data: projects } = await projectsQuery.limit(100);

      if (projects && projects.length > 0) {
        // Get all KB IDs and linked doc IDs in parallel
        const kbIds = [...new Set(projects.map((p: any) => p.kb_id).filter(Boolean))];
        const projectIds = projects.map((p: any) => p.id);
        
        const [workspaceCounts, linkedDocsData] = await Promise.all([
          // Count workspace docs for all KBs in parallel
          Promise.all(
            kbIds.map(kbId =>
              (adminSupabase
                .from('rag_documents') as any)
                .select('*', { count: 'exact', head: true })
                .eq('knowledge_base_id', kbId)
                .is('deleted_at', null)
                .gt('chunk_count', 0)
            )
          ),
          // Get all linked docs
          (adminSupabase
            .from('project_documents') as any)
            .select('project_id, document_id')
            .in('project_id', projectIds)
        ]);

        const kbCountMap = new Map(kbIds.map((kbId, i) => [kbId, workspaceCounts[i].count || 0]));
        const linkedDocMap = new Map<string, string[]>();
        
        (linkedDocsData.data || []).forEach((ld: any) => {
          if (!linkedDocMap.has(ld.project_id)) {
            linkedDocMap.set(ld.project_id, []);
          }
          linkedDocMap.get(ld.project_id)!.push(ld.document_id);
        });

        // Count linked docs in parallel
        const allLinkedDocIds = [...new Set(
          Array.from(linkedDocMap.values()).flat()
        )];
        
        let linkedDocCounts = new Map<string, number>();
        if (allLinkedDocIds.length > 0) {
          const { data: linkedDocs } = await (adminSupabase
            .from('rag_documents') as any)
            .select('id')
            .in('id', allLinkedDocIds)
            .is('deleted_at', null)
            .gt('chunk_count', 0);
          
          const linkedDocSet = new Set((linkedDocs || []).map((d: any) => d.id));
          
          linkedDocMap.forEach((docIds, projectId) => {
            const count = docIds.filter(id => linkedDocSet.has(id)).length;
            linkedDocCounts.set(projectId, count);
          });
        }

        projects.forEach((project: any) => {
          const workspaceCount = kbCountMap.get(project.kb_id) || 0;
          const linkedCount = linkedDocCounts.get(project.id) || 0;
          const totalDocCount = workspaceCount + linkedCount;

          if (totalDocCount > 0) {
            results.push({
              id: project.id,
              type: 'project',
              title: project.client_name || 'Untitled Project',
              subtitle: project.description,
              breadcrumb: `Project: ${project.status || 'Active'}`,
              metadata: `${totalDocCount} documents`,
            });
          }
        });
      }
    }

    // Search knowledge bases - OPTIMIZED with parallel queries
    if (types.includes('knowledgeBase')) {
      const kbQuery = (adminSupabase
        .from('rag_knowledge_bases') as any)
        .select('id, name, description, is_active, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
      
      if (query.trim()) {
        kbQuery.ilike('name', `%${query}%`);
      }
      
      const { data: knowledgeBases } = await kbQuery.limit(100);

      if (knowledgeBases && knowledgeBases.length > 0) {
        // Count documents for all KBs in parallel
        const kbIds = knowledgeBases.map((kb: any) => kb.id);
        const countPromises = kbIds.map((kbId: string) =>
          (adminSupabase
            .from('rag_documents') as any)
            .select('*', { count: 'exact', head: true })
            .eq('knowledge_base_id', kbId)
            .is('deleted_at', null)
            .gt('chunk_count', 0)
        );

        const counts = await Promise.all(countPromises);

        knowledgeBases.forEach((kb: any, index: number) => {
          const count = counts[index].count || 0;
          // Show KB even without documents
          results.push({
            id: kb.id,
            type: 'knowledgeBase',
            title: kb.name || 'Untitled Knowledge Base',
            subtitle: kb.description,
            breadcrumb: 'Knowledge Base',
            metadata: count > 0 ? `${count} documents` : 'No documents yet',
          });
        });
      }
    }

    // Sort results: prioritize projects first, then exact matches, then by relevance
    const queryLower = query.toLowerCase();
    results.sort((a, b) => {
      // First, prioritize projects
      const typeOrder: Record<string, number> = { project: 0, document: 1, knowledgeBase: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      
      // Then by exact match at start
      const aTitleLower = a.title.toLowerCase();
      const bTitleLower = b.title.toLowerCase();
      const aStarts = aTitleLower.startsWith(queryLower) ? 1 : 0;
      const bStarts = bTitleLower.startsWith(queryLower) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      
      // Finally by title
      return a.title.localeCompare(b.title);
    });

    // Apply pagination
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);
    const hasMore = total > offset + limit;

    return NextResponse.json({
      results: paginatedResults,
      total,
      page,
      limit,
      hasMore,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/chat/contexts/search:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

