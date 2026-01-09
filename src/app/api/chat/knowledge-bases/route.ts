import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/knowledge-bases
 * Get list of knowledge bases that the user can chat with
 * Returns active knowledge bases with document counts (only KBs with chunks)
 * Uses the same pattern as /api/chat/documents and /api/chat/projects to bypass RLS
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Fetch all active knowledge bases
    // Note: rag_knowledge_bases doesn't have deleted_at column, only is_active
    const { data: knowledgeBases, error: kbError } = await (adminSupabase
      .from('rag_knowledge_bases') as any)
      .select('id, name, description, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (kbError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch knowledge bases',
          details: kbError.message,
        },
        { status: 500 }
      );
    }

    if (!knowledgeBases || knowledgeBases.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // For each knowledge base, count documents with chunks
    const knowledgeBasesWithCounts = await Promise.all(
      (knowledgeBases || []).map(async (kb: any) => {
        const { count } = await (adminSupabase
          .from('rag_documents') as any)
          .select('*', { count: 'exact', head: true })
          .eq('knowledge_base_id', kb.id)
          .is('deleted_at', null)
          .gt('chunk_count', 0);

        return {
          id: kb.id,
          title: kb.name,
          description: kb.description,
          metadata: `${count || 0} documents`,
          document_count: count || 0,
        };
      })
    );

    // Filter to only knowledge bases with documents (chunks)
    const knowledgeBasesWithDocuments = knowledgeBasesWithCounts.filter(
      (kb: any) => kb.document_count > 0
    );

    return NextResponse.json(
      knowledgeBasesWithDocuments,
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

