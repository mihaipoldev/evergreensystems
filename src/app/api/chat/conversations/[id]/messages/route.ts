import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { callOpenRouter, streamResponse, formatMessages } from '@/features/chat/services/ai-service';
import { generateQueryEmbedding, retrieveRelevantChunks, retrieveRelevantChunksForProject, retrieveRelevantChunksForKnowledgeBase, retrieveRelevantChunksForMultipleContexts } from '@/features/chat/services/rag-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const { content, context_type, context_id } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Verify conversation exists and belongs to user
    const { data: conversation, error: convError } = await (supabase
      .from('chat_conversations') as any)
      .select('id, title, context_type, context_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get contexts from junction table
    const { data: contexts, error: contextsError } = await (supabase
      .from('chat_conversation_contexts') as any)
      .select('context_type, context_id')
      .eq('conversation_id', conversationId);

    if (contextsError) {
      console.error('Error fetching contexts:', contextsError);
      // Continue without contexts if fetch fails
    }

    // Note: Contexts are now managed via chat_conversation_contexts junction table
    // Old context_type/context_id parameters are ignored for new conversations
    // Keeping this for backward compatibility but it won't affect RAG

    // Auto-generate title from first message if title is null
    if (!conversation.title) {
      const title = content.slice(0, 100).trim();
      try {
        await (supabase
          .from('chat_conversations') as any)
          .update({ title })
          .eq('id', conversationId);
      } catch (titleError) {
        // Log but don't fail the request if title update fails
        console.error('Error updating conversation title:', titleError);
      }
    }

    // Save user message
    const { data: userMessage, error: userMsgError } = await (supabase
      .from('chat_messages') as any)
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: content.trim(),
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Get all previous messages for context
    const { data: previousMessages, error: prevMsgError } = await (supabase
      .from('chat_messages') as any)
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (prevMsgError) {
      console.error('Error fetching previous messages:', prevMsgError);
      return NextResponse.json(
        { error: 'Failed to fetch conversation history' },
        { status: 500 }
      );
    }

    // RAG: Retrieve relevant chunks if contexts are present
    let ragContext = '';
    let retrievedChunks: Array<{ id: string; content: string; document_id: string; similarity_score?: number; document_title?: string }> = [];

    // Use ONLY contexts from junction table (no fallback to old columns)
    const contextsList = (contexts && contexts.length > 0) 
      ? contexts.map((ctx: any) => ({ type: ctx.context_type, id: ctx.context_id }))
      : [];

    console.log('[RAG] Checking contexts:', { 
      contextsFromJunction: contexts?.length || 0,
      contextsList,
    });

    // Use multi-context RAG if we have contexts
    if (contextsList.length > 0) {
      try {
        console.log('[RAG] Attempting multi-context RAG retrieval for', contextsList.length, 'context(s)');
        
        // Generate embedding for the user's query
        console.log('[RAG] Generating query embedding...');
        const queryEmbedding = await generateQueryEmbedding(content.trim());
        console.log('[RAG] Query embedding generated, length:', queryEmbedding.length);

        // Retrieve relevant chunks from all contexts
        console.log('[RAG] Retrieving chunks for multiple contexts...');
        const chunks = await retrieveRelevantChunksForMultipleContexts(contextsList, queryEmbedding, 20);
        console.log('[RAG] Retrieved chunks:', chunks.length);

        if (chunks.length > 0) {
          retrievedChunks = chunks;
          
          // Group chunks by document for better context organization
          const chunksByDocument = new Map<string, typeof chunks>();
          chunks.forEach((chunk) => {
            const docId = chunk.document_id;
            if (!chunksByDocument.has(docId)) {
              chunksByDocument.set(docId, []);
            }
            chunksByDocument.get(docId)!.push(chunk);
          });

          // Build context prompt with retrieved chunks, organized by document
          const chunksText = Array.from(chunksByDocument.entries())
            .map(([docId, docChunks]) => {
              const docTitle = docChunks[0]?.document_title || 'Untitled Document';
              const docChunksText = docChunks
                .map((chunk, index) => {
                  return `[Document: ${docTitle} - Chunk ${index + 1}]\n${chunk.content}`;
                })
                .join('\n\n');
              return docChunksText;
            })
            .join('\n\n---\n\n');

          const contextTypes = new Set(contextsList.map((ctx: { type: string; id: string }) => ctx.type));
          const contextDescription = contextTypes.size === 1 
            ? `${contextTypes.values().next().value}${contextsList.length > 1 ? 's' : ''}`
            : 'multiple contexts';

          ragContext = `You are a helpful AI assistant answering questions about ${contextDescription}.

Context Information:
${chunksText}

Instructions:
- Synthesize information across all provided documents from ${contextsList.length} context(s)
- When referencing information, specify which document it came from (e.g., "According to [Document: Niche Intelligence Report - Chunk 1]..." or "As stated in the Niche Intelligence Report...")
- Enable cross-document and cross-context comparison and analysis
- If information conflicts between documents or contexts, note the discrepancy
- Provide comprehensive answers that draw from all relevant documents
- Be specific and accurate in your responses
- If the question cannot be answered with the provided context, politely explain that you don't have that information in the available contexts`;
          
          console.log('[RAG] Multi-context RAG built successfully, chunks:', chunks.length, 'documents:', chunksByDocument.size, 'contexts:', contextsList.length);
        } else {
          console.warn('[RAG] No chunks retrieved for contexts');
        }
      } catch (ragError) {
        console.error('[RAG] Error retrieving multi-context RAG:', ragError);
        // Continue without RAG context if retrieval fails
      }
    } else {
      console.log('[RAG] Skipping RAG - no contexts available');
    }

    // Format messages for OpenRouter
    const formattedMessages = formatMessages(previousMessages || []);

    // Add system message with RAG context if available
    if (ragContext) {
      formattedMessages.unshift({
        role: 'system',
        content: ragContext,
      });
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = '';

        try {
          // Call OpenRouter with streaming
          const response = await callOpenRouter(formattedMessages, {
            model: 'openai/gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2000,
            stream: true,
          });

          // Stream chunks
          for await (const chunk of streamResponse(response)) {
            if (chunk.type === 'chunk' && chunk.content) {
              fullResponse += chunk.content;
              const data = JSON.stringify({
                type: 'chunk',
                content: chunk.content,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } else if (chunk.type === 'done') {
              // Extract citations from response if RAG was used
              const citations: Array<{
                chunk_id: string;
                document_id: string;
                text: string;
                section?: string;
              }> = [];

              if (retrievedChunks.length > 0) {
                // Simple citation extraction: look for chunk references in the response
                // This is a basic implementation - can be improved with more sophisticated parsing
                retrievedChunks.forEach((chunk, index) => {
                  // Check if chunk content appears in the response (simple substring match)
                  // Or if chunk number is mentioned (e.g., "Chunk 1", "Chunk 2")
                  const chunkMentioned = fullResponse.toLowerCase().includes(
                    chunk.content.slice(0, 50).toLowerCase()
                  ) || fullResponse.includes(`Chunk ${index + 1}`) || fullResponse.includes(`chunk ${index + 1}`)
                    || (chunk.document_title && fullResponse.includes(chunk.document_title));

                  if (chunkMentioned) {
                    citations.push({
                      chunk_id: chunk.id,
                      document_id: chunk.document_id,
                      text: chunk.content.slice(0, 200), // First 200 chars as citation text
                      section: chunk.document_title || `Chunk ${index + 1}`, // Use document title if available
                    });
                  }
                });
              }

              // Save assistant message with citations
              const { data: assistantMessage, error: assistantMsgError } = await (supabase
                .from('chat_messages') as any)
                .insert({
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: fullResponse,
                  citations: citations.length > 0 ? citations : null,
                  metadata: {
                    model: 'openai/gpt-4o-mini',
                    rag_used: retrievedChunks.length > 0,
                    chunks_retrieved: retrievedChunks.length,
                  },
                })
                .select()
                .single();

              if (assistantMsgError) {
                console.error('Error saving assistant message:', assistantMsgError);
              }

              // Update conversation updated_at
              await (supabase
                .from('chat_conversations') as any)
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId);

              const doneData = JSON.stringify({
                type: 'done',
                messageId: assistantMessage?.id || '',
              });
              controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
              controller.close();
            } else if (chunk.type === 'error') {
              const errorData = JSON.stringify({
                type: 'error',
                error: chunk.error || 'Unknown error',
              });
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
              controller.close();
            }
          }
        } catch (error) {
          console.error('Error in streaming:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/chat/conversations/[id]/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

