import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

    const { id } = await params;

    // Get conversation
    const { data: conversation, error: conversationError } = await (supabase
      .from('chat_conversations') as any)
      .select('id, title, context_type, context_id, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (conversationError) {
      if (conversationError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      console.error('Error fetching conversation:', conversationError);
      return NextResponse.json(
        { error: conversationError.message || 'Failed to fetch conversation' },
        { status: 500 }
      );
    }

    // Get contexts from junction table
    const { data: contexts, error: contextsError } = await (supabase
      .from('chat_conversation_contexts') as any)
      .select('context_type, context_id')
      .eq('conversation_id', id);

    if (contextsError) {
      console.error('Error fetching contexts:', contextsError);
      // Continue even if contexts can't be fetched
    }

    // Get messages
    const { data: messages, error: messagesError } = await (supabase
      .from('chat_messages') as any)
      .select('id, role, content, citations, metadata, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: messagesError.message || 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...conversation,
      contexts: (contexts || []).map((ctx: any) => ({
        context_type: ctx.context_type,
        context_id: ctx.context_id,
      })),
      messages: (messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        citation: msg.citations && Array.isArray(msg.citations) && msg.citations.length > 0
          ? msg.citations[0]
          : undefined,
        action: msg.metadata?.action || undefined,
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/chat/conversations/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, context_type, context_id } = body;

    // Validate context_type if provided
    if (context_type && !['general', 'document', 'project', 'knowledgeBase', 'subject'].includes(context_type)) {
      return NextResponse.json(
        { error: 'Invalid context_type' },
        { status: 400 }
      );
    }

    // Check if conversation exists and belongs to user
    const { data: existing, error: checkError } = await (supabase
      .from('chat_conversations') as any)
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Update conversation
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (context_type !== undefined) updateData.context_type = context_type;
    if (context_id !== undefined) updateData.context_id = context_id;

    const { data: conversation, error } = await (supabase
      .from('chat_conversations') as any)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/chat/conversations/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if conversation exists and belongs to user
    const { data: existing, error: checkError } = await (supabase
      .from('chat_conversations') as any)
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Delete conversation (messages will be cascade deleted)
    const { error } = await (supabase
      .from('chat_conversations') as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/chat/conversations/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

