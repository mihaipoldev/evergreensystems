import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, context_type, context_id, contexts } = body;
    
    console.log('[API] Creating conversation with:', { 
      hasTitle: !!title, 
      hasContextType: !!context_type, 
      hasContextId: !!context_id, 
      contextsCount: contexts?.length || 0,
      contexts: contexts 
    });

    // Support both old format (single context) and new format (multiple contexts)
    // Old format: context_type, context_id
    // New format: contexts array [{ context_type, context_id }]
    
    // Validate old format if provided
    if (context_type && !['general', 'document', 'project', 'knowledgeBase', 'subject'].includes(context_type)) {
      return NextResponse.json(
        { error: 'Invalid context_type' },
        { status: 400 }
      );
    }

    // Validate new format if provided
    if (contexts && Array.isArray(contexts)) {
      for (const ctx of contexts) {
        if (!ctx.context_type || !ctx.context_id) {
          return NextResponse.json(
            { error: 'Each context must have context_type and context_id' },
            { status: 400 }
          );
        }
        if (!['document', 'project', 'knowledgeBase'].includes(ctx.context_type)) {
          return NextResponse.json(
            { error: `Invalid context_type: ${ctx.context_type}. Must be document, project, or knowledgeBase` },
            { status: 400 }
          );
        }
      }
    }

    // Create conversation
    const { data: conversation, error } = await (supabase
      .from('chat_conversations') as any)
      .insert({
        user_id: user.id,
        title: title || null,
        context_type: context_type || null, // Keep for backward compatibility
        context_id: context_id || null, // Keep for backward compatibility
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create conversation' },
        { status: 500 }
      );
    }

    // Add contexts to junction table if provided
    if (contexts && Array.isArray(contexts) && contexts.length > 0) {
      console.log('[Conversation Creation] Adding contexts:', contexts.length, contexts);
      const contextsToInsert = contexts.map((ctx: any) => ({
        conversation_id: conversation.id,
        context_type: ctx.context_type,
        context_id: ctx.context_id,
      }));

      const { data: insertedContexts, error: contextsError } = await (supabase
        .from('chat_conversation_contexts') as any)
        .insert(contextsToInsert)
        .select();

      if (contextsError) {
        console.error('[Conversation Creation] Error adding contexts:', contextsError);
        // Try to add contexts one by one as fallback
        for (const ctx of contextsToInsert) {
          try {
            await (supabase
              .from('chat_conversation_contexts') as any)
              .insert(ctx)
              .select();
            console.log('[Conversation Creation] Successfully added context:', ctx);
          } catch (singleError) {
            console.error('[Conversation Creation] Failed to add single context:', ctx, singleError);
          }
        }
      } else {
        console.log('[Conversation Creation] Successfully added contexts:', insertedContexts?.length || 0);
      }
    } else if (context_type && context_id && context_type !== 'general') {
      // Migrate old format to new junction table
      await (supabase
        .from('chat_conversation_contexts') as any)
        .insert({
          conversation_id: conversation.id,
          context_type: context_type,
          context_id: context_id,
        });
    }

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/chat/conversations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations with message count
    const { data: conversations, error: conversationsError } = await (supabase
      .from('chat_conversations') as any)
      .select('id, title, context_type, context_id, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json(
        { error: conversationsError.message || 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        const { count } = await (supabase
          .from('chat_messages') as any)
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id);

        return {
          ...conv,
          message_count: count || 0,
        };
      })
    );

    return NextResponse.json(conversationsWithCounts, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/chat/conversations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

