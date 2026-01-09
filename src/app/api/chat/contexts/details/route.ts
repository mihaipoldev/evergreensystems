import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/contexts/details?type=document&id=xxx
 * Get details for a specific context (document, project, or knowledge base)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400 });
    }

    const adminSupabase = createServiceRoleClient();

    switch (type) {
      case 'document': {
        const { data: doc } = await (adminSupabase
          .from('rag_documents') as any)
          .select('id, title, chunk_count')
          .eq('id', id)
          .single();
        
        if (!doc) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        
        return NextResponse.json({
          title: doc.title || 'Untitled Document',
          icon: '📄',
          metadata: `${doc.chunk_count || 0} chunks`,
        });
      }
      
      case 'project': {
        const { data: project } = await (adminSupabase
          .from('projects') as any)
          .select('id, client_name, description')
          .eq('id', id)
          .single();
        
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        
        return NextResponse.json({
          title: project.client_name || 'Untitled Project',
          icon: '📁',
          description: project.description,
        });
      }
      
      case 'knowledgeBase': {
        const { data: kb } = await (adminSupabase
          .from('rag_knowledge_bases') as any)
          .select('id, name, description')
          .eq('id', id)
          .single();
        
        if (!kb) {
          return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
        }
        
        return NextResponse.json({
          title: kb.name || 'Untitled Knowledge Base',
          icon: '📚',
          description: kb.description,
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in GET /api/chat/contexts/details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

