import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/projects
 * Get list of projects that the user can chat with
 * Returns active projects with document counts
 * Uses the same pattern as /api/chat/documents to bypass RLS
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client to bypass RLS (same as /api/chat/documents)
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

    // Get all active projects (not archived)
    const { data: allProjects, error: projectsError } = await (adminSupabase
      .from('projects') as any)
      .select('id, client_name, kb_id, status, description')
      .is('archived_at', null)
      .order('client_name', { ascending: true });

    if (projectsError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch projects',
          details: projectsError.message,
        },
        { status: 500 }
      );
    }

    // For each project, count documents (workspace + linked)
    const projectsWithDocCounts = await Promise.all(
      (allProjects || []).map(async (project: any) => {
        // Count workspace documents (from project KB)
        const { count: workspaceCount } = await (adminSupabase
          .from('rag_documents') as any)
          .select('*', { count: 'exact', head: true })
          .eq('knowledge_base_id', project.kb_id)
          .is('deleted_at', null)
          .gt('chunk_count', 0);

        // Count linked documents (via junction table)
        const { count: linkedCount } = await (adminSupabase
          .from('project_documents') as any)
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        // Get linked document IDs to check if they have chunks
        const { data: linkedDocs } = await (adminSupabase
          .from('project_documents') as any)
          .select('document_id')
          .eq('project_id', project.id);

        const linkedDocIds = (linkedDocs || []).map((d: any) => d.document_id);
        
        let linkedWithChunksCount = 0;
        if (linkedDocIds.length > 0) {
          const { count } = await (adminSupabase
            .from('rag_documents') as any)
            .select('*', { count: 'exact', head: true })
            .in('id', linkedDocIds)
            .is('deleted_at', null)
            .gt('chunk_count', 0);
          linkedWithChunksCount = count || 0;
        }

        const totalDocCount = (workspaceCount || 0) + linkedWithChunksCount;

        return {
          id: project.id,
          name: project.client_name,
          description: project.description,
          status: project.status,
          document_count: totalDocCount,
        };
      })
    );

    // Filter to only projects with documents (chunks)
    const projectsWithDocuments = projectsWithDocCounts.filter(
      (project: any) => project.document_count > 0
    );

    return NextResponse.json(
      projectsWithDocuments,
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

