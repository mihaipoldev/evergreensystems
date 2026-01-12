"use client";

import { useEffect, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { addContextToConversation, removeContextFromConversation, getConversationContexts } from '../services/chat-api';
import type { ContextItem } from '../types';

interface ProjectChatContextProps {
  projectId: string;
  projectName: string;
}

export const ProjectChatContext = ({ projectId, projectName }: ProjectChatContextProps) => {
  const { setContexts, removeContext, currentConversationId } = useChatContext();
  const lastSetRef = useRef<{ projectId: string; projectName: string } | null>(null);

  useEffect(() => {
    // Skip if we've already set this exact context
    if (
      lastSetRef.current?.projectId === projectId &&
      lastSetRef.current?.projectName === projectName
    ) {
      return;
    }

    const context: ContextItem = {
      id: projectId,
      type: 'project',
      icon: '📁',
      title: projectName,
      description: `Context: Project "${projectName}"`,
    };
    
    const saveContextToDatabase = async () => {
      if (!currentConversationId) {
        // No conversation yet - just add to local state, will be saved when conversation is created
        setContexts([context]);
        lastSetRef.current = { projectId, projectName };
        return;
      }

      // ALWAYS save to database first, then sync from database
      try {
        // Clear all existing contexts from database first
        const existingContexts = await getConversationContexts(currentConversationId);
        for (const ctx of existingContexts) {
          try {
            await removeContextFromConversation(currentConversationId, ctx.id);
          } catch (error) {
            console.error('Error removing existing context:', error);
          }
        }

        // Add new context to database
        await addContextToConversation(currentConversationId, {
          context_type: 'project',
          context_id: projectId,
        });

        // Now sync from database to ensure we're always in sync
        const dbContexts = await getConversationContexts(currentConversationId);
        
        // Build all contexts from database first, then replace all at once (no flash)
        if (dbContexts && dbContexts.length > 0) {
          const contextPromises = dbContexts.map(async (ctx: any) => {
            try {
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
            return {
              id: ctx.context_id,
              type: ctx.context_type as 'document' | 'project' | 'knowledgeBase',
              icon: ctx.context_type === 'document' ? '📄' : ctx.context_type === 'project' ? '📁' : '📚',
              title: ctx.context_type === 'project' ? projectName : `Loading ${ctx.context_type}...`,
              description: `${ctx.context_type}: ${ctx.context_id}`,
            };
          });
          
          const contexts = await Promise.all(contextPromises);
          // Replace all contexts atomically - no flash!
          setContexts(contexts);
        } else {
          setContexts([]);
        }
        
        lastSetRef.current = { projectId, projectName };
      } catch (error) {
        console.error('Error saving project context to database:', error);
        // Fallback: add to local state if database save fails
        setContexts([context]);
        lastSetRef.current = { projectId, projectName };
      }
    };

    saveContextToDatabase();
    
    // Cleanup: remove context from database when component unmounts
    return () => {
      if (currentConversationId) {
        getConversationContexts(currentConversationId)
          .then((contexts) => {
            const contextToRemove = contexts.find(
              (ctx: any) => ctx.context_id === projectId && ctx.context_type === 'project'
            );
            if (contextToRemove) {
              removeContextFromConversation(currentConversationId, contextToRemove.id)
                .then(() => {
                  // Sync from database after removal
                  getConversationContexts(currentConversationId)
                    .then(async (updatedContexts) => {
                      if (updatedContexts && updatedContexts.length > 0) {
                        const contextPromises = updatedContexts.map(async (ctx: any) => {
                          try {
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
                          return {
                            id: ctx.context_id,
                            type: ctx.context_type as 'document' | 'project' | 'knowledgeBase',
                            icon: ctx.context_type === 'document' ? '📄' : ctx.context_type === 'project' ? '📁' : '📚',
                            title: `Loading ${ctx.context_type}...`,
                            description: `${ctx.context_type}: ${ctx.context_id}`,
                          };
                        });
                        const contexts = await Promise.all(contextPromises);
                        setContexts(contexts);
                      } else {
                        setContexts([]);
                      }
                    });
                })
                .catch((error) => {
                  console.error('Error removing context from database:', error);
                });
            }
          })
          .catch((error) => {
            console.error('Error fetching contexts for cleanup:', error);
          });
      } else {
        removeContext(projectId, 'project');
      }
      lastSetRef.current = null;
    };
  }, [projectId, projectName, currentConversationId, setContexts, removeContext]);

  return null; // This component doesn't render anything
};

