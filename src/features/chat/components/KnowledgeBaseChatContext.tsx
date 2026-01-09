"use client";

import { useEffect, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import type { ContextItem } from '../types';

interface KnowledgeBaseChatContextProps {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBaseDescription?: string;
}

/**
 * Client component that sets chat context when viewing a knowledge base
 * This allows the chat to know which knowledge base the user is viewing
 */
export function KnowledgeBaseChatContext({
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBaseDescription,
}: KnowledgeBaseChatContextProps) {
  const { clearContexts, addContext, removeContext } = useChatContext();
  const lastSetRef = useRef<{ knowledgeBaseId: string; knowledgeBaseName: string; knowledgeBaseDescription?: string } | null>(null);

  useEffect(() => {
    // Skip if we've already set this exact context
    if (
      lastSetRef.current?.knowledgeBaseId === knowledgeBaseId &&
      lastSetRef.current?.knowledgeBaseName === knowledgeBaseName &&
      lastSetRef.current?.knowledgeBaseDescription === knowledgeBaseDescription
    ) {
      return;
    }

    const context: ContextItem = {
      id: knowledgeBaseId,
      type: 'knowledgeBase',
      icon: '📚',
      title: knowledgeBaseName,
      description: knowledgeBaseDescription || `Chat about this knowledge base: ${knowledgeBaseName}`,
    };

    // Clear all existing contexts and set this as the active context
    clearContexts();
    addContext(context);
    lastSetRef.current = { knowledgeBaseId, knowledgeBaseName, knowledgeBaseDescription };
    
    // Cleanup: remove only this specific context when component unmounts
    return () => {
      removeContext(knowledgeBaseId, 'knowledgeBase');
      lastSetRef.current = null;
    };
  }, [knowledgeBaseId, knowledgeBaseName, knowledgeBaseDescription, clearContexts, addContext, removeContext]);

  return null; // This component doesn't render anything
}

