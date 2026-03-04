-- Chat Conversations
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context (only ONE should be set, or none for general)
  knowledge_base_id UUID REFERENCES rag_knowledge_bases(id),
  project_id UUID REFERENCES projects(id),
  subject_id UUID REFERENCES research_subjects(id),
  document_id UUID REFERENCES rag_documents(id),
  
  -- Metadata
  title TEXT, -- Auto-generated from first message
  context_type TEXT NOT NULL CHECK (context_type IN (
    'knowledge_base',
    'project', 
    'subject',
    'document',
    'general'
  )),
  
  -- Settings
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  
  -- Stats
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_conversations_kb ON chat_conversations(knowledge_base_id) WHERE knowledge_base_id IS NOT NULL;
CREATE INDEX idx_conversations_project ON chat_conversations(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_conversations_subject ON chat_conversations(subject_id) WHERE subject_id IS NOT NULL;
CREATE INDEX idx_conversations_document ON chat_conversations(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX idx_conversations_created_by ON chat_conversations(created_by);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- RAG metadata
  context_used JSONB, -- Which chunks/documents were used
  sources JSONB, -- Array of {document_id, chunk_ids, relevance_score}
  
  -- Model info
  model TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  
  -- Timing
  response_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id, created_at);

-- Chat Context Documents (for multi-doc chats)
CREATE TABLE chat_context_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  
  -- Why included
  reason TEXT, -- 'primary', 'related', 'user_added'
  relevance_score DECIMAL(3,2),
  
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID,
  
  UNIQUE(conversation_id, document_id)
);

CREATE INDEX idx_context_docs_conversation ON chat_context_documents(conversation_id);

-- RLS Policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_context_documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (auth.uid() = created_by);

-- Messages inherit conversation permissions
CREATE POLICY "Users can view messages in own conversations"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE created_by = auth.uid()
    )
  );

-- Context documents follow conversation permissions
CREATE POLICY "Users can view context docs in own conversations"
  ON chat_context_documents FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE created_by = auth.uid()
    )
  );