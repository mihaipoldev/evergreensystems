"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ContextItem } from '../types';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeContexts: ContextItem[];
  addContext: (context: ContextItem) => void;
  removeContext: (contextId: string, contextType?: string) => void;
  clearContexts: () => void;
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpenState] = useState(false);
  const [activeContexts, setActiveContexts] = useState<ContextItem[]>([]);
  const [currentConversationId, setCurrentConversationIdState] = useState<string | null>(null);

  // Load persisted state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('chat-sidebar-open');
    if (stored !== null) {
      setIsOpenState(stored === 'true');
    }
    const storedConversationId = localStorage.getItem('chat-current-conversation-id');
    if (storedConversationId) {
      setCurrentConversationIdState(storedConversationId);
    }
    const storedContexts = localStorage.getItem('chat-active-contexts');
    if (storedContexts) {
      try {
        const parsed = JSON.parse(storedContexts);
        if (Array.isArray(parsed)) {
          setActiveContexts(parsed);
        }
      } catch (e) {
        console.error('Failed to parse stored contexts:', e);
      }
    }
  }, []);

  // Persist state to localStorage
  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
    localStorage.setItem('chat-sidebar-open', String(open));
  }, []);

  const setCurrentConversationId = useCallback((id: string | null) => {
    setCurrentConversationIdState(id);
    if (id) {
      localStorage.setItem('chat-current-conversation-id', id);
    } else {
      localStorage.removeItem('chat-current-conversation-id');
    }
  }, []);

  const addContext = useCallback((context: ContextItem) => {
    setActiveContexts((prev) => {
      // Check if context already exists (by id and type to handle same id different types)
      const exists = prev.some(
        (c) => c.id === context.id && c.type === context.type
      );
      if (exists) {
        return prev;
      }
      const updated = [...prev, context];
      localStorage.setItem('chat-active-contexts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeContext = useCallback((contextId: string, contextType?: string) => {
    setActiveContexts((prev) => {
      const updated = prev.filter((c) => {
        if (contextType) {
          return !(c.id === contextId && c.type === contextType);
        }
        return c.id !== contextId;
      });
      localStorage.setItem('chat-active-contexts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearContexts = useCallback(() => {
    setActiveContexts([]);
    localStorage.removeItem('chat-active-contexts');
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        activeContexts,
        addContext,
        removeContext,
        clearContexts,
        currentConversationId,
        setCurrentConversationId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

