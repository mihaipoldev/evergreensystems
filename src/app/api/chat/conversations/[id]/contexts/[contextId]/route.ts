import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/chat/conversations/[id]/contexts/[contextId]
 * Remove a context from a conversation
 * Note: contextId here is the junction table ID, not the context_id
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; contextId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId, contextId } = await params;

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

    // Verify context exists and belongs to conversation
    const { data: context, error: contextCheckError } = await (supabase
      .from('chat_conversation_contexts') as any)
      .select('id')
      .eq('id', contextId)
      .eq('conversation_id', conversationId)
      .single();

    if (contextCheckError || !context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }

    // Delete context
    const { error: deleteError } = await (supabase
      .from('chat_conversation_contexts') as any)
      .delete()
      .eq('id', contextId)
      .eq('conversation_id', conversationId);

    if (deleteError) {
      console.error('Error deleting context:', deleteError);
      return NextResponse.json(
        { error: deleteError.message || 'Failed to delete context' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/chat/conversations/[id]/contexts/[contextId]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

