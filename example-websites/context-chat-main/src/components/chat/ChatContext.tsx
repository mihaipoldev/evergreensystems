import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  activeContext: ContextItem;
  setActiveContext: (context: ContextItem) => void;
}

export interface ContextItem {
  id: string;
  type: 'general' | 'report' | 'project' | 'knowledgeBase' | 'subject';
  icon: string;
  title: string;
  description?: string;
  metadata?: string;
}

const defaultContext: ContextItem = {
  id: '1',
  type: 'report',
  icon: '📄',
  title: '3D Printing Service Providers Report',
  description: 'Context includes: Report content (8 sections), 47 source URLs, Market data',
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeContext, setActiveContext] = useState<ContextItem>(defaultContext);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        isExpanded,
        setIsExpanded,
        activeContext,
        setActiveContext,
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
