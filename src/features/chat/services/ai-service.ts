/**
 * AI Service for OpenRouter integration
 * Handles API calls, streaming, and message formatting
 */

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  messageId?: string;
  error?: string;
}

/**
 * Format conversation messages for OpenRouter API
 */
export function formatMessages(
  conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }>
): OpenRouterMessage[] {
  return conversationMessages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Call OpenRouter API with streaming support
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
): Promise<Response> {
  const openRouterKey = process.env.OPENROUTER_KEY;

  if (!openRouterKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const {
    model = 'openai/gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 2000,
    stream = true,
  } = options;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openRouterKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://evergreensystems.ai',
      'X-Title': 'Evergreen Systems AI',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API error: ${errorData}`);
  }

  return response;
}

/**
 * Stream response from OpenRouter
 * Returns async generator that yields chunks
 */
export async function* streamResponse(
  response: Response
): AsyncGenerator<StreamChunk, void, unknown> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            yield { type: 'done' };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;

            if (delta?.content) {
              yield {
                type: 'chunk',
                content: delta.content,
              };
            }
          } catch (e) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done' };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              yield {
                type: 'chunk',
                content: delta.content,
              };
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    yield { type: 'done' };
  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    reader.releaseLock();
  }
}

