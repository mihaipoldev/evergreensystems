export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citation?: {
    text: string;
    section: string;
  };
  citations?: Array<{
    chunk_id: string;
    document_id: string;
    text: string;
    section?: string;
  }>;
  action?: {
    label: string;
    icon?: string;
  };
}

export interface ContextItem {
  id: string;
  type: 'general' | 'document' | 'project' | 'knowledgeBase' | 'subject';
  icon: string;
  title: string;
  description?: string;
  metadata?: string;
}

// New type for context selection results
export interface ContextSearchResult {
  id: string;
  type: 'document' | 'project' | 'knowledgeBase';
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  metadata?: string;
}

export interface ConversationItem {
  id: string;
  icon: string;
  title: string;
  messages: number;
  time: string;
}

