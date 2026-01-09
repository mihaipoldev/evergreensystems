"use client";

import type { Message, ContextItem } from '../types';

export interface Conversation {
  id: string;
  title: string | null;
  context_type: 'general' | 'document' | 'project' | 'knowledgeBase' | 'subject' | null;
  context_id: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface CreateConversationRequest {
  title?: string;
  context_type?: 'general' | 'document' | 'project' | 'knowledgeBase' | 'subject'; // Deprecated: use contexts array
  context_id?: string; // Deprecated: use contexts array
  contexts?: Array<{ context_type: 'document' | 'project' | 'knowledgeBase'; context_id: string }>;
}

export interface UpdateConversationRequest {
  title?: string;
  context_type?: 'general' | 'document' | 'project' | 'knowledgeBase' | 'subject';
  context_id?: string;
}

export interface SendMessageRequest {
  content: string;
  // Contexts are now managed at conversation level, not per message
  // Keeping these for backward compatibility but they're deprecated
  context_type?: 'general' | 'document' | 'project' | 'knowledgeBase' | 'subject';
  context_id?: string;
}

/**
 * Create a new conversation
 */
export async function createConversation(
  data: CreateConversationRequest
): Promise<Conversation> {
  const response = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create conversation');
  }

  return response.json();
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch('/api/chat/conversations', {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get conversations');
  }

  return response.json();
}

/**
 * Get a single conversation with messages
 */
export async function getConversation(id: string): Promise<ConversationWithMessages> {
  const response = await fetch(`/api/chat/conversations/${id}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get conversation');
  }

  return response.json();
}

/**
 * Send a message and stream the response
 */
export async function sendMessage(
  conversationId: string,
  data: SendMessageRequest,
  onChunk: (chunk: string) => void,
  onDone: (messageId: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    onError(error.error || 'Failed to send message');
    return;
  }

  if (!response.body) {
    onError('Response body is null');
    return;
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
          const data = line.slice(6).trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'chunk' && parsed.content) {
              onChunk(parsed.content);
            } else if (parsed.type === 'done' && parsed.messageId) {
              onDone(parsed.messageId);
              return;
            } else if (parsed.type === 'error' && parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    reader.releaseLock();
  }
}

/**
 * Update a conversation
 */
export async function updateConversation(
  id: string,
  data: UpdateConversationRequest
): Promise<Conversation> {
  const response = await fetch(`/api/chat/conversations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update conversation');
  }

  return response.json();
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`/api/chat/conversations/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete conversation');
  }
}

/**
 * Context management types and functions
 */
export interface AddContextRequest {
  context_type: 'document' | 'project' | 'knowledgeBase';
  context_id: string;
}

export interface ConversationContext {
  id: string;
  context_type: 'document' | 'project' | 'knowledgeBase';
  context_id: string;
  created_at: string;
}

/**
 * Add a context to a conversation
 */
export async function addContextToConversation(
  conversationId: string,
  context: AddContextRequest
): Promise<ConversationContext> {
  const response = await fetch(`/api/chat/conversations/${conversationId}/contexts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add context');
  }

  return response.json();
}

/**
 * Remove a context from a conversation
 */
export async function removeContextFromConversation(
  conversationId: string,
  contextId: string
): Promise<void> {
  const response = await fetch(`/api/chat/conversations/${conversationId}/contexts/${contextId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove context');
  }
}

/**
 * Get all contexts for a conversation
 */
export async function getConversationContexts(
  conversationId: string
): Promise<ConversationContext[]> {
  const response = await fetch(`/api/chat/conversations/${conversationId}/contexts`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get contexts');
  }

  return response.json();
}

