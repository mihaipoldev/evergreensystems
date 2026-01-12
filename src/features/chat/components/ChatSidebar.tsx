"use client";

import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../contexts/ChatContext';
import { ChatHeader } from './ChatHeader';
import { ContextDropdown } from './ContextDropdown';
import { SuggestedQuestions } from './SuggestedQuestions';
import { ChatMessages } from './ChatMessages';
import type { Message } from '../types';
import { ChatInput } from './ChatInput';
import { SettingsPanel } from './SettingsPanel';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import {
  createConversation,
  getConversation,
  sendMessage,
  getConversationContexts,
  addContextToConversation,
  type ConversationWithMessages,
} from '../services/chat-api';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export const ChatSidebar = () => {
  const { isOpen, setIsOpen, currentConversationId, setCurrentConversationId, activeContexts, addContext, clearContexts } = useChatContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Swipe-to-close state for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeThreshold = 100; // pixels

  // Load conversation when currentConversationId changes
  // Use a ref to track the last loaded conversation to prevent unnecessary reloads
  const lastLoadedConversationId = useRef<string | null>(null);
  
  useEffect(() => {
    // Only load if conversation ID actually changed and we're not currently typing
    if (isOpen && currentConversationId && currentConversationId !== lastLoadedConversationId.current && !isTyping) {
      lastLoadedConversationId.current = currentConversationId;
      loadConversation(currentConversationId);
    } else if (isOpen && !currentConversationId) {
      // Clear messages if no conversation
      lastLoadedConversationId.current = null;
      setMessages([]);
    }
    // Only depend on isOpen and currentConversationId - not isTyping
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentConversationId]);

  const loadConversation = async (conversationId: string, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const conversation: ConversationWithMessages = await getConversation(conversationId);
      const serverMessages = conversation.messages || [];
      
      // Load contexts from conversation
      try {
        const contexts = await getConversationContexts(conversationId);
        clearContexts(); // Clear existing contexts
        
        // Fetch full details for each context
        if (contexts && contexts.length > 0) {
          const contextPromises = contexts.map(async (ctx) => {
            try {
              // Fetch details based on type
              const response = await fetch(`/api/chat/contexts/details?type=${ctx.context_type}&id=${ctx.context_id}`);
              if (response.ok) {
                const details = await response.json();
                return {
                  id: ctx.context_id,
                  type: ctx.context_type as 'document' | 'project' | 'knowledgeBase',
                  icon: details.icon || (ctx.context_type === 'document' ? '📄' : ctx.context_type === 'project' ? '📁' : '📚'),
                  title: details.title || `Loading ${ctx.context_type}...`,
                  description: details.description,
                  metadata: details.metadata,
                };
              }
            } catch (error) {
              console.error(`Error fetching details for ${ctx.context_type} ${ctx.context_id}:`, error);
            }
            
            // Fallback if fetch fails
            return {
              id: ctx.context_id,
              type: ctx.context_type as 'document' | 'project' | 'knowledgeBase',
              icon: ctx.context_type === 'document' ? '📄' : ctx.context_type === 'project' ? '📁' : '📚',
              title: `Loading ${ctx.context_type}...`,
              description: `${ctx.context_type}: ${ctx.context_id}`,
            };
          });
          
          const contextItems = await Promise.all(contextPromises);
          contextItems.forEach(ctx => addContext(ctx));
        }
      } catch (contextError) {
        console.error('Error loading contexts:', contextError);
        // Continue without contexts if fetch fails
      }
      
      // Only replace messages if we don't have any optimistic updates (temp/streaming messages)
      const hasTempMessages = messages.some((msg) => msg.id.startsWith('temp-') || msg.id.startsWith('streaming-'));
      
      if (!hasTempMessages) {
        // No optimistic updates, safe to replace all
        setMessages(serverMessages);
        // Trigger scroll to bottom after messages are set and DOM is rendered
        // Use requestAnimationFrame to wait for React to update DOM
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setShouldScrollToBottom(true);
            // Reset flag after scrolling completes
            setTimeout(() => setShouldScrollToBottom(false), 600);
          });
        });
      } else {
        // Merge with existing messages to preserve optimistic updates
        setMessages((prev) => {
          // Check if we actually need to update
          const prevWithoutTemp = prev.filter((msg) => !msg.id.startsWith('temp-') && !msg.id.startsWith('streaming-'));
          const hasStreamingMessages = prev.some((msg) => msg.id.startsWith('streaming-'));
          
          // If we have streaming messages that are complete (not currently typing), we need to update
          // Otherwise, check if non-temp messages match
          if (!hasStreamingMessages) {
            const needsUpdate = 
              prevWithoutTemp.length !== serverMessages.length ||
              prevWithoutTemp.some((msg) => {
                const serverMsg = serverMessages.find((m) => m.id === msg.id);
                return !serverMsg || serverMsg.content !== msg.content;
              });
            
            if (!needsUpdate) {
              return prev; // No changes needed, return same array reference
            }
          }
          // If we have streaming messages, proceed with merge to replace them
          
          // Perform merge
          const merged: Message[] = [];
          const serverMap = new Map(serverMessages.map((m) => [m.id, m]));
          
          // Keep temp/streaming messages, replace others with server versions
          prev.forEach((msg) => {
            if (msg.id.startsWith('temp-') || msg.id.startsWith('streaming-')) {
              // Try to find matching server message by content to replace temp/streaming ID
              const match = serverMessages.find(
                (sm) => sm.role === msg.role && sm.content === msg.content
              );
              if (match) {
                merged.push(match); // Replace temp/streaming with real message
              } else {
                merged.push(msg); // Keep temp/streaming if no match found
              }
            } else {
              const serverMsg = serverMap.get(msg.id);
              if (serverMsg) {
                merged.push(serverMsg);
                serverMap.delete(msg.id);
              } else {
                merged.push(msg);
              }
            }
          });
          
          // Add any new server messages we haven't seen
          serverMap.forEach((msg) => merged.push(msg));
          
          // Sort by creation order from server
          return merged.sort((a, b) => {
            const aIndex = serverMessages.findIndex((m) => m.id === a.id);
            const bIndex = serverMessages.findIndex((m) => m.id === b.id);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            // If both are temp/streaming, maintain order
            const aPrevIndex = prev.findIndex((m) => m.id === a.id);
            const bPrevIndex = prev.findIndex((m) => m.id === b.id);
            return aPrevIndex - bPrevIndex;
          });
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load conversation',
        variant: 'destructive',
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessageContent = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    try {
      let conversationId = currentConversationId;
      let needsConversationCreation = false;
      
      // ALWAYS get contexts from activeContexts - these should be in sync with DB
      const contexts = activeContexts
        .filter(ctx => ctx.type !== 'general')
        .map(ctx => ({
          context_type: ctx.type as 'document' | 'project' | 'knowledgeBase',
          context_id: ctx.id,
        }));
      
      console.log('[ChatSidebar] Preparing to send message. Active contexts:', activeContexts.length, 'Contexts to save:', contexts.length, contexts);

      // Check if we need to create conversation, but don't block on it
      if (!conversationId) {
        needsConversationCreation = true;
        // Use temporary ID for now - will update after creation
        conversationId = `temp-${Date.now()}`;
      }

      // Add user message to UI IMMEDIATELY (before any async operations)
      const tempUserMessageId = `temp-user-${Date.now()}`;
      const userMessage: Message = {
        id: tempUserMessageId,
        role: 'user',
        content: userMessageContent,
      };
      
      // Add user message IMMEDIATELY using flushSync to force synchronous render
      flushSync(() => {
        setMessages((prev) => [...prev, userMessage]);
      });
      
      // Create streaming assistant message and add it immediately
      const streamingMessageId = `streaming-${Date.now()}`;
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
      };
      
      // Add streaming message immediately after user message
      flushSync(() => {
        setMessages((prev) => [...prev, streamingMessage]);
      });
      setStreamingMessageId(streamingMessageId);
      
      // Trigger scroll to bottom immediately after messages are rendered
      requestAnimationFrame(() => {
        setShouldScrollToBottom(true);
        setTimeout(() => setShouldScrollToBottom(false), 100);
      });

      // Now create conversation in background (non-blocking) if needed
      if (needsConversationCreation) {
        let fullResponse = '';
        
        console.log('[ChatSidebar] Creating conversation with contexts:', contexts.length, contexts);
        createConversation({
          ...(contexts.length > 0 ? { contexts } : {}),
        }).then(async (newConversation) => {
          const realConversationId = newConversation.id;
          lastLoadedConversationId.current = realConversationId;
          setCurrentConversationId(realConversationId);
          
          // Verify contexts were saved and add any missing ones
          if (contexts.length > 0) {
            try {
              const savedContexts = await getConversationContexts(realConversationId);
              console.log('[ChatSidebar] Contexts saved in DB:', savedContexts.length, savedContexts);
              
              const savedIds = new Set(savedContexts.map((ctx: any) => `${ctx.context_type}-${ctx.context_id}`));
              const missingContexts = contexts.filter((ctx) => {
                const ctxKey = `${ctx.context_type}-${ctx.context_id}`;
                return !savedIds.has(ctxKey);
              });
              
              if (missingContexts.length > 0) {
                console.log('[ChatSidebar] Missing contexts, adding them:', missingContexts);
                // Add any missing contexts
                for (const ctx of missingContexts) {
                  try {
                    await addContextToConversation(realConversationId, ctx);
                    console.log('[ChatSidebar] Successfully added missing context:', ctx);
                  } catch (error) {
                    console.error('[ChatSidebar] Failed to save missing context:', ctx, error);
                  }
                }
              } else {
                console.log('[ChatSidebar] All contexts were saved correctly');
              }
            } catch (error) {
              console.error('[ChatSidebar] Error verifying contexts after conversation creation:', error);
              // Try to add all contexts as fallback
              for (const ctx of contexts) {
                try {
                  await addContextToConversation(realConversationId, ctx);
                  console.log('[ChatSidebar] Fallback: Added context:', ctx);
                } catch (error) {
                  console.error('[ChatSidebar] Fallback: Failed to add context:', ctx, error);
                }
              }
            }
          }
          
          // Now send message with real conversation ID
          sendMessage(
            realConversationId,
            {
              content: userMessageContent,
            },
            (chunk: string) => {
              fullResponse += chunk;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMessageId
                    ? { ...msg, content: fullResponse }
                    : msg
                )
              );
            },
            (messageId: string) => {
              setStreamingMessageId(null);
              setIsTyping(false);
            },
            (error: string) => {
              setMessages((prev) => prev.filter((msg) => msg.id !== streamingMessageId));
              setStreamingMessageId(null);
              setIsTyping(false);
              toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
              });
            }
          ).catch((error) => {
            console.error('Error sending message:', error);
            setStreamingMessageId(null);
            setIsTyping(false);
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to send message',
              variant: 'destructive',
            });
          });
        }).catch((error) => {
          console.error('Error creating conversation:', error);
          setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id && msg.id !== streamingMessageId));
          setStreamingMessageId(null);
          setIsTyping(false);
          toast({
            title: 'Error',
            description: 'Failed to create conversation',
            variant: 'destructive',
          });
        });
        
        // Don't send message yet if we're creating conversation - wait for it
        return;
      }

      let fullResponse = '';

      // Verify contexts are in database before sending (for existing conversations)
      if (contexts.length > 0 && conversationId) {
        try {
          const dbContexts = await getConversationContexts(conversationId);
          console.log('[ChatSidebar] Verifying contexts in DB before sending. Expected:', contexts.length, 'Found in DB:', dbContexts.length);
          
          const dbContextKeys = new Set(dbContexts.map((ctx: any) => `${ctx.context_type}-${ctx.context_id}`));
          const missingInDB = contexts.filter((ctx) => {
            const key = `${ctx.context_type}-${ctx.context_id}`;
            return !dbContextKeys.has(key);
          });
          
          if (missingInDB.length > 0) {
            console.warn('[ChatSidebar] Some contexts missing in DB, adding them now:', missingInDB);
            for (const ctx of missingInDB) {
              try {
                await addContextToConversation(conversationId, ctx);
                console.log('[ChatSidebar] Added missing context to DB:', ctx);
              } catch (error) {
                console.error('[ChatSidebar] Failed to add context to DB:', ctx, error);
              }
            }
          }
        } catch (error) {
          console.error('[ChatSidebar] Error verifying contexts:', error);
        }
      }

      // Send message and stream response (conversation already exists)
      // Note: contexts are now managed at the conversation level, not per message
      await sendMessage(
        conversationId,
        {
          content: userMessageContent,
        },
        (chunk: string) => {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (messageId: string) => {
          // Don't update the ID immediately - it causes a flash because React sees it as a new component
          // The streaming ID works fine for display, and it will be updated when conversation is loaded next time
          // Just mark that streaming is complete
          setStreamingMessageId(null);
          setIsTyping(false);
          
          // Store the real message ID in a way that doesn't cause re-render
          // We'll update it later if needed, but for now keep the streaming ID
          // This prevents the flash while maintaining functionality
        },
        (error: string) => {
          // Remove streaming message on error
          setMessages((prev) => prev.filter((msg) => msg.id !== streamingMessageId));
          setStreamingMessageId(null);
          setIsTyping(false);
          toast({
            title: 'Error',
            description: error,
            variant: 'destructive',
          });
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setStreamingMessageId(null);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  // Swipe-to-close handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || touchStartX.current === null || touchStartY.current === null) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const deltaX = touchCurrentX - touchStartX.current;
    const deltaY = touchCurrentY - touchStartY.current;
    
    // Only trigger if it's primarily a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      // Swiping right - allow default to enable closing
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    
    // If swiped right more than threshold, close the chat
    if (deltaX > swipeThreshold) {
      setIsOpen(false);
    }
    
    // Reset touch state
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const sidebarWidth = 500;

  // Shared chat content JSX
  const chatContent = (
    <div 
      className="relative flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ChatHeader
        onSettingsClick={() => setShowSettings(true)}
        onHistoryClick={() => setShowHistory(true)}
        onContextClick={() => setShowContextDropdown(true)}
        onNewChat={handleNewChat}
      />

      <div className="relative">
        {/* ContextDropdown disabled - using ContextSearchPopover in ChatInput instead */}
        {/* <ContextDropdown
          isOpen={showContextDropdown}
          onClose={() => setShowContextDropdown(false)}
        /> */}
      </div>

      {loading && messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading conversation...</div>
        </div>
      )}

      <ChatMessages 
        messages={messages} 
        isTyping={isTyping && !streamingMessageId}
        showSuggestedQuestions={!loading && messages.length === 0}
        onQuestionClick={handleQuestionClick}
        shouldScrollToBottom={shouldScrollToBottom}
      />

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isTyping}
      />

      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <ChatHistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onNewChat={handleNewChat}
        onConversationSelect={(id) => {
          setCurrentConversationId(id);
          loadConversation(id);
        }}
      />
    </div>
  );

  // Mobile: Use Sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className={cn(
            "w-screen max-w-none p-0 rounded-none border-0 z-[70]",
            "md:hidden", // Only show on mobile
            "h-[100dvh]", // Use dynamic viewport height which accounts for mobile browser UI
            "max-h-[100dvh]",
            "overflow-hidden"
          )}
          style={{
            position: 'fixed',
            top: 0,
          }}
        >
          <div className="h-full bg-card flex flex-col overflow-hidden">
            {chatContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use framer-motion sidebar
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: sidebarWidth }}
          animate={{ x: 0 }}
          exit={{ x: sidebarWidth }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed right-0 top-0 h-screen w-[500px] bg-card border-l border-border chat-shadow-lg flex flex-col z-[70] overflow-hidden"
        >
          {chatContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
