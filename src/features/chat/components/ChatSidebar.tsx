"use client";

import { useState, useRef, useEffect } from 'react';
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

export const ChatSidebar = () => {
  const { isOpen, currentConversationId, setCurrentConversationId, activeContexts, addContext, clearContexts } = useChatContext();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

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

      // Create conversation if it doesn't exist
      if (!conversationId) {
        // Create conversation with multiple contexts if available
        const contexts = activeContexts
          .filter(ctx => ctx.type !== 'general')
          .map(ctx => ({
            context_type: ctx.type as 'document' | 'project' | 'knowledgeBase',
            context_id: ctx.id,
          }));

        const newConversation = await createConversation({
          ...(contexts.length > 0 ? { contexts } : {}),
        });
        conversationId = newConversation.id;
        lastLoadedConversationId.current = conversationId; // Update ref to prevent reload
        setCurrentConversationId(conversationId);
        
        // Ensure contexts are saved - if they weren't saved during creation, save them now
        if (contexts.length > 0) {
          try {
            // Verify contexts were saved
            const savedContexts = await getConversationContexts(conversationId);
            const savedIds = new Set(savedContexts.map((ctx: any) => `${ctx.context_type}-${ctx.context_id}`));
            const expectedIds = new Set(contexts.map(ctx => `${ctx.context_type}-${ctx.context_id}`));
            
            // Save any missing contexts
            for (const ctx of contexts) {
              const ctxKey = `${ctx.context_type}-${ctx.context_id}`;
              if (!savedIds.has(ctxKey)) {
                try {
                  await addContextToConversation(conversationId, ctx);
                } catch (error) {
                  console.error('Failed to save context after conversation creation:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error verifying contexts after conversation creation:', error);
          }
        }
      }

      // Add user message to UI immediately (optimistic update)
      const tempUserMessageId = `temp-user-${Date.now()}`;
      const userMessage: Message = {
        id: tempUserMessageId,
        role: 'user',
        content: userMessageContent,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Create streaming assistant message
      const streamingMessageId = `streaming-${Date.now()}`;
      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
      };
      setMessages((prev) => [...prev, streamingMessage]);
      setStreamingMessageId(streamingMessageId);

      let fullResponse = '';

      // Send message and stream response
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

  const sidebarWidth = 500;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed right-0 top-0 h-screen bg-card border-l border-border chat-shadow-lg flex flex-col z-[70] overflow-hidden"
        >
          <div className="relative flex flex-col h-full">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

