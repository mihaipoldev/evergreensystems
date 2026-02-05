import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/conversations/[id]/contexts
 * Add a context to a conversation
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const { context_type, context_id } = body;

    // Validate required fields
    if (!context_type || !context_id) {
      return NextResponse.json(
        { error: 'context_type and context_id are required' },
        { status: 400 }
      );
    }

    // Validate context_type
    if (!['document', 'project', 'knowledgeBase'].includes(context_type)) {
      return NextResponse.json(
        { error: 'Invalid context_type. Must be document, project, or knowledgeBase' },
        { status: 400 }
      );
    }

    // Verify conversation exists and belongs to user
    const { data: conversation, error: convError } = await (supabase
      .from('chat_conversations') as any)
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Insert context into junction table (UNIQUE constraint will prevent duplicates)
    const { data: context, error: contextError } = await (supabase
      .from('chat_conversation_contexts') as any)
      .insert({
        conversation_id: conversationId,
        context_type,
        context_id,
      })
      .select()
      .single();

    if (contextError) {
      // Duplicate: return existing row so add is idempotent
      if (contextError.code === '23505') {
        const { data: existing } = await (supabase
          .from('chat_conversation_contexts') as any)
          .select()
          .eq('conversation_id', conversationId)
          .eq('context_type', context_type)
          .eq('context_id', context_id)
          .single();
        if (existing) {
          return NextResponse.json(existing, { status: 200 });
        }
      }
      console.error('Error adding context:', contextError);
      return NextResponse.json(
        { error: contextError.message || 'Failed to add context' },
        { status: 500 }
      );
    }

    return NextResponse.json(context, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/chat/conversations/[id]/contexts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/conversations/[id]/contexts
 * Get all contexts for a conversation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    // Verify conversation exists and belongs to user
    const { data: conversation, error: convError } = await (supabase
      .from('chat_conversations') as any)
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get contexts from junction table
    const { data: contexts, error: contextsError } = await (supabase
      .from('chat_conversation_contexts') as any)
      .select('id, context_type, context_id, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (contextsError) {
      console.error('Error fetching contexts:', contextsError);
      return NextResponse.json(
        { error: contextsError.message || 'Failed to fetch contexts' },
        { status: 500 }
      );
    }

    return NextResponse.json(contexts || [], { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/chat/conversations/[id]/contexts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

