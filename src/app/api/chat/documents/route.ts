import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/documents
 * Get list of documents that the user can chat with
 * Returns documents with chunks (for RAG)
 * Uses the same pattern as /api/intel/documents to bypass RLS
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client to bypass RLS (same as /api/intel/documents)
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

    // Get all documents first (same pattern as /api/intel/documents)
    // Then filter for those with chunks on the client side
    const { data: allDocuments, error: docsError } = await (adminSupabase
      .from('rag_documents') as any)
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (docsError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch documents',
          details: docsError.message,
        },
        { status: 500 }
      );
    }

    // Filter for documents with chunks (for RAG)
    const documentsWithChunks = (allDocuments || []).filter(
      (doc: any) => doc.chunk_count > 0
    );

    return NextResponse.json(
      documentsWithChunks,
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

