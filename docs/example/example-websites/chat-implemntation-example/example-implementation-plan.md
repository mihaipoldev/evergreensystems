# Chat Implementation Guide
Complete checklist for adding contextual intelligence chat to your platform

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
**Database & Core Infrastructure**

#### Day 1-2: Database Setup
- [ ] Run chat schema migrations (`chat-schema.sql`)
  - chat_conversations table
  - chat_messages table
  - chat_context_documents table
  - RLS policies
- [ ] Create PostgreSQL helper function:
  ```sql
  CREATE OR REPLACE FUNCTION increment_message_count(conv_id UUID)
  RETURNS VOID AS $$
  BEGIN
    UPDATE chat_conversations
    SET message_count = message_count + 1
    WHERE id = conv_id;
  END;
  $$ LANGUAGE plpgsql;
  ```
- [ ] Add vector search function (if not exists):
  ```sql
  CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    filter_document_ids uuid[]
  )
  RETURNS TABLE (
    id uuid,
    document_id uuid,
    document_title text,
    content text,
    similarity float,
    metadata jsonb
  )
  LANGUAGE sql STABLE
  AS $$
    SELECT
      c.id,
      c.document_id,
      d.title as document_title,
      c.content,
      1 - (c.embedding <=> query_embedding) as similarity,
      c.metadata
    FROM rag_chunks c
    JOIN rag_documents d ON c.document_id = d.id
    WHERE 
      1 - (c.embedding <=> query_embedding) > match_threshold
      AND c.document_id = ANY(filter_document_ids)
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
  $$;
  ```

#### Day 3-4: Core Files
- [ ] Create `/features/rag/chat/` folder structure
- [ ] Add `types.ts` with all interfaces
- [ ] Add `rag.ts` with RAG retrieval logic
- [ ] Add `hooks.ts` with React hooks
- [ ] Add `data.ts` for Supabase queries
- [ ] Add `/features/rag/chat/components/` folder

#### Day 5: Basic Components
- [ ] Create `ChatSidebar.tsx` (main UI)
- [ ] Create `ChatHeader.tsx`
- [ ] Create `ChatMessages.tsx`
- [ ] Create `ChatInput.tsx`
- [ ] Test locally with hardcoded context

---

### Phase 2: API & Streaming (Week 2)
**Backend Logic**

#### Day 1-2: API Routes
- [ ] Create `/app/api/chat/route.ts`
  - POST endpoint for sending messages
  - RAG retrieval integration
  - Claude API streaming
- [ ] Create `/app/api/chat/stream/[messageId]/route.ts`
  - SSE (Server-Sent Events) for real-time streaming
  - Handle connection management
- [ ] Create `/app/api/chat/conversations/route.ts`
  - GET: List conversations
  - POST: Create conversation
  - DELETE: Archive conversation

#### Day 3-4: Streaming Implementation
- [ ] Implement Server-Sent Events (SSE) endpoint
- [ ] Test streaming in development
- [ ] Handle disconnection/reconnection
- [ ] Add error recovery
- [ ] Optimize token usage

#### Day 5: Testing
- [ ] Test with single document context
- [ ] Test with KB context
- [ ] Test conversation persistence
- [ ] Test streaming performance
- [ ] Fix bugs

---

### Phase 3: Context Integration (Week 3)
**Make Chat Context-Aware**

#### Day 1-2: Context Switching UI
- [ ] Create `ChatContextIndicator.tsx`
- [ ] Create `ChatContextSwitcher.tsx` (dropdown)
- [ ] Build context detection logic
  - Auto-detect from current page
  - Allow manual switching
- [ ] Add context to ChatHeader

#### Day 3-4: Integration Points
- [ ] Add "Chat" button to KB detail page
  ```tsx
  // In /app/intel/knowledge-bases/[id]/page.tsx
  <button onClick={() => openChat({
    type: 'knowledge_base',
    id: kb.id,
    name: kb.name,
    documentIds: [] // Will be fetched
  })}>
    💬 Chat with this KB
  </button>
  ```
- [ ] Add "Chat" button to Project detail page
- [ ] Add "Ask AI" button to Report viewer
- [ ] Add floating "Chat" FAB to all pages

#### Day 5: Multi-Context Support
- [ ] Implement chat_context_documents table usage
- [ ] Allow adding multiple documents to chat
- [ ] Build "Add to Chat" functionality
- [ ] Test cross-document queries

---

### Phase 4: Intelligence Features (Week 4)
**Smart Suggestions & Actions**

#### Day 1-2: Suggested Questions
- [ ] Create `/app/api/chat/suggestions/route.ts`
- [ ] Implement question generation logic:
  ```typescript
  async function generateSuggestions(context: ChatContext) {
    // Extract key data from documents
    const documents = await getDocumentsForContext(context);
    
    // Use Claude to generate contextual questions
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Given this context, generate 6 smart questions:
        ${JSON.stringify(documents, null, 2)}`
      }]
    });
    
    return parseQuestions(response.content);
  }
  ```
- [ ] Create `ChatSuggestedQuestions.tsx`
- [ ] Cache suggestions per context
- [ ] Add click handlers

#### Day 3-4: Citations & Sources
- [ ] Create `ChatSourceCitation.tsx`
- [ ] Implement source extraction from responses
- [ ] Add click-to-navigate functionality
- [ ] Highlight cited sections in reports (if report is visible)

#### Day 5: Quick Actions
- [ ] Detect actionable requests (e.g., "generate email")
- [ ] Add action buttons to assistant responses
- [ ] Integrate with existing workflows
  - Trigger "Email Sequence Generator"
  - Trigger "ICP Research" 
  - Create project from chat
- [ ] Test action flows

---

### Phase 5: Polish & History (Week 5)
**Production-Ready**

#### Day 1-2: Chat History
- [ ] Create `ChatHistoryList.tsx`
- [ ] Implement conversation listing
- [ ] Add search/filter
- [ ] Add archive functionality
- [ ] Add export conversation (markdown)

#### Day 3: Settings & Customization
- [ ] Create `ChatSettings.tsx` panel
- [ ] Add model selection (Haiku/Sonnet/Opus)
- [ ] Add response style slider
- [ ] Add citation preferences
- [ ] Save settings per user

#### Day 4: Mobile Optimization
- [ ] Test on mobile devices
- [ ] Adjust sidebar width (full-screen on mobile)
- [ ] Optimize touch interactions
- [ ] Test keyboard behavior
- [ ] Add pull-to-close gesture

#### Day 5: Performance Optimization
- [ ] Implement message pagination
- [ ] Add conversation caching
- [ ] Optimize RAG queries
- [ ] Add loading skeletons
- [ ] Reduce re-renders

---

## 📋 KEY INTEGRATION POINTS

### 1. Layout Integration
```tsx
// app/intel/layout.tsx
import { ChatProvider } from '@/features/rag/chat/ChatProvider';
import { ChatSidebar } from '@/features/rag/chat/components/ChatSidebar';

export default function IntelLayout({ children }) {
  return (
    <ChatProvider>
      <div className="flex h-screen">
        {/* Existing sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Chat sidebar */}
        <ChatSidebar />
      </div>
    </ChatProvider>
  );
}
```

### 2. Context Provider
```tsx
// features/rag/chat/ChatProvider.tsx
'use client';

import { createContext, useContext } from 'react';
import { useChatSidebar } from './hooks';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const chat = useChatSidebar();
  
  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
}
```

### 3. Floating Action Button
```tsx
// components/ChatFAB.tsx
'use client';

import { useChatContext } from '@/features/rag/chat/ChatProvider';

export function ChatFAB() {
  const { openChat } = useChatContext();
  
  return (
    <button
      onClick={() => openChat()}
      className="
        fixed bottom-6 right-6 z-30
        w-14 h-14 rounded-full
        bg-blue-600 hover:bg-blue-700
        text-white shadow-lg
        flex items-center justify-center
        transition-all hover:scale-110
      "
    >
      💬
    </button>
  );
}
```

---

## 🎨 STYLING NOTES

### Tailwind Classes to Use
```css
/* Sidebar */
.chat-sidebar {
  @apply fixed right-0 top-0 h-full w-full lg:w-[500px];
  @apply bg-white dark:bg-gray-900;
  @apply border-l border-gray-200 dark:border-gray-800;
  @apply shadow-2xl;
  @apply transition-transform duration-300;
}

/* Message Bubbles */
.message-user {
  @apply bg-blue-600 text-white rounded-lg px-4 py-3;
}

.message-assistant {
  @apply bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3;
}

/* Citation Link */
.citation-link {
  @apply text-xs text-blue-600 dark:text-blue-400;
  @apply hover:underline cursor-pointer;
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Environment Variables
```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # For server-side
```

### Database Indexes (Performance)
```sql
-- Already in schema, but verify:
CREATE INDEX idx_conversations_kb ON chat_conversations(knowledge_base_id);
CREATE INDEX idx_conversations_project ON chat_conversations(project_id);
CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id, created_at);

-- For vector search (if using pgvector):
CREATE INDEX idx_chunks_embedding ON rag_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

### API Rate Limiting
```typescript
// Consider adding rate limiting to API routes
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

// In route handler:
const { success } = await ratelimit.limit(user.id);
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

---

## 💡 BEST PRACTICES

### 1. Error Handling
```typescript
// Always wrap in try-catch
try {
  const chunks = await retrieveContext(query, context);
} catch (error) {
  console.error('RAG retrieval failed:', error);
  // Fallback to general assistant mode
  return generateResponseWithoutContext(query);
}
```

### 2. Token Management
```typescript
// Track token usage
const response = await anthropic.messages.create({...});
await logTokenUsage({
  conversation_id,
  tokens_used: response.usage.total_tokens,
  cost: calculateCost(response.usage),
});
```

### 3. Caching Strategy
```typescript
// Cache suggested questions
const cacheKey = `suggestions:${context.type}:${context.id}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

const suggestions = await generateSuggestions(context);
await redis.setex(cacheKey, 3600, suggestions); // 1 hour
return suggestions;
```

### 4. Progressive Enhancement
```typescript
// Start simple, add features incrementally:
// ✅ Phase 1: Basic chat with single doc
// ✅ Phase 2: Context switching
// ✅ Phase 3: Suggested questions
// ✅ Phase 4: Quick actions
// ✅ Phase 5: Advanced features
```

---

## 🎯 SUCCESS METRICS

Track these KPIs:
- [ ] Average messages per conversation
- [ ] Suggested question click-through rate
- [ ] Context switch frequency
- [ ] Token usage per conversation
- [ ] User satisfaction (thumbs up/down)
- [ ] Action completion rate (e.g., workflows triggered)

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: Streaming doesn't work
**Solution:** Check SSE headers are correct:
```typescript
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

### Issue: Context not found
**Solution:** Verify document has `should_chunk = true` and chunks exist:
```sql
SELECT d.id, d.title, d.should_chunk, COUNT(c.id) as chunk_count
FROM rag_documents d
LEFT JOIN rag_chunks c ON c.document_id = d.id
GROUP BY d.id;
```

### Issue: High latency
**Solution:** Optimize RAG retrieval:
- Reduce maxChunksPerDoc (10 → 5)
- Increase similarityThreshold (0.7 → 0.75)
- Use Haiku for faster responses
- Cache frequently accessed contexts

---

## 🎓 LEARNING RESOURCES

- **Anthropic Messages API:** https://docs.anthropic.com/claude/reference/messages
- **RAG Best Practices:** https://www.anthropic.com/guides/retrieval
- **Server-Sent Events:** https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **Supabase Realtime:** https://supabase.com/docs/guides/realtime

---

## ✅ FINAL CHECKLIST

Before going live:
- [ ] All database migrations run
- [ ] All RLS policies tested
- [ ] API routes return proper errors
- [ ] Streaming works on production
- [ ] Context switching tested for all types
- [ ] Mobile experience verified
- [ ] Rate limiting in place
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Performance monitoring (Vercel Analytics, etc.)
- [ ] Token usage logging active
- [ ] User feedback mechanism added
- [ ] Documentation updated

---

**You're ready to build intelligent, context-aware chat! 🚀**