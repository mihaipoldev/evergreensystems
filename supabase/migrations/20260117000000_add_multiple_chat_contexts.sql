-- Create chat_conversation_contexts junction table
CREATE TABLE IF NOT EXISTS public.chat_conversation_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('document', 'project', 'knowledgeBase')),
  context_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, context_type, context_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conv_contexts_conv_id 
  ON public.chat_conversation_contexts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_contexts_type_id 
  ON public.chat_conversation_contexts(context_type, context_id);

-- Enable RLS
ALTER TABLE public.chat_conversation_contexts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own conversation contexts"
  ON public.chat_conversation_contexts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE chat_conversations.id = chat_conversation_contexts.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own conversation contexts"
  ON public.chat_conversation_contexts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE chat_conversations.id = chat_conversation_contexts.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own conversation contexts"
  ON public.chat_conversation_contexts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE chat_conversations.id = chat_conversation_contexts.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- Migrate existing contexts from chat_conversations to chat_conversation_contexts
INSERT INTO public.chat_conversation_contexts (conversation_id, context_type, context_id, created_at)
SELECT 
  id as conversation_id,
  context_type,
  context_id,
  created_at
FROM public.chat_conversations
WHERE context_type IS NOT NULL 
  AND context_id IS NOT NULL
  AND context_type != 'general'
ON CONFLICT (conversation_id, context_type, context_id) DO NOTHING;

