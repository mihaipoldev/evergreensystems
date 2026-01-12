"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faX } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useChatContext } from '../contexts/ChatContext';
import { ContextSearchPopover } from './ContextSearchPopover';
import type { ContextSearchResult } from '../types';
import { addContextToConversation, removeContextFromConversation, getConversationContexts } from '../services/chat-api';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const autocompleteSuggestions = [
  'What are the red flags for this niche?',
  'What are the best list sources?',
  'What are the main competitors?',
  'What are the pricing trends?',
];

export const ChatInput = ({ value, onChange, onSend, disabled }: ChatInputProps) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [contextPopoverOpen, setContextPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { activeContexts, addContext, removeContext, clearContexts, currentConversationId } = useChatContext();
  const { toast } = useToast();
  const maxChars = 2000;

  // ALWAYS sync contexts from database when conversation changes
  // This ensures contexts ALWAYS come from the database, not local state
  useEffect(() => {
    const syncContextsFromDB = async () => {
      if (!currentConversationId) {
        // Don't clear contexts if no conversation - user might be adding contexts before creating conversation
        return;
      }
      
      try {
        // ALWAYS fetch from database first
        const dbContexts = await getConversationContexts(currentConversationId);
        
        // ALWAYS clear local state and rebuild from DB to ensure we're always in sync
        clearContexts();
        
        // Fetch full details for each context
        if (dbContexts && dbContexts.length > 0) {
          const contextPromises = dbContexts.map(async (ctx) => {
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
          
          const contexts = await Promise.all(contextPromises);
          contexts.forEach(ctx => addContext(ctx));
        }
      } catch (error) {
        console.error('Error syncing contexts from DB:', error);
      }
    };
    
    syncContextsFromDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId]);

  useEffect(() => {
    if (value.length > 5) {
      const filtered = autocompleteSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setShowAutocomplete(false);
    }
  }, [value]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '72px'; // Reset to min height first
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 72; // 3 rows * 24px (line-height)
      const maxHeight = 200; // Maximum height in pixels
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Set initial height on mount
  useEffect(() => {
    if (textareaRef.current && !value) {
      textareaRef.current.style.height = '72px';
    }
  }, []);

  // Prevent body scroll when scrolling inside textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleWheel = (e: WheelEvent) => {
      if (!textarea) return;
      
      const { scrollTop, scrollHeight, clientHeight } = textarea;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // If scrolling up and at top, prevent default to stop body scroll
      if (e.deltaY < 0 && isAtTop) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // If scrolling down and at bottom, prevent default to stop body scroll
      if (e.deltaY > 0 && isAtBottom) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    let lastTouchY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!textarea) return;
      
      const { scrollTop, scrollHeight, clientHeight } = textarea;
      const isAtTop = scrollTop <= 1;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      const touch = e.touches[0];
      if (!touch) return;
      
      const deltaY = touch.clientY - lastTouchY;
      lastTouchY = touch.clientY;
      
      // If at top and trying to scroll up, prevent
      if (deltaY > 0 && isAtTop) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // If at bottom and trying to scroll down, prevent
      if (deltaY < 0 && isAtBottom) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    textarea.addEventListener('wheel', handleWheel, { passive: false });
    textarea.addEventListener('touchstart', handleTouchStart, { passive: true });
    textarea.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      textarea.removeEventListener('wheel', handleWheel);
      textarea.removeEventListener('touchstart', handleTouchStart);
      textarea.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowAutocomplete(false);
    textareaRef.current?.focus();
  };

  const handleSelectContext = async (context: ContextSearchResult) => {
    // Convert ContextSearchResult to ContextItem
    const getIconForType = (type: string) => {
      switch (type) {
        case 'document':
          return '📄';
        case 'project':
          return '📁';
        case 'knowledgeBase':
          return '📚';
        default:
          return '📄';
      }
    };

    const contextItem = {
      id: context.id,
      type: context.type,
      icon: getIconForType(context.type),
      title: context.title,
      description: context.subtitle,
      metadata: context.metadata,
    };

    // ALWAYS save to database first if conversation exists
    if (currentConversationId) {
      try {
        await addContextToConversation(currentConversationId, {
          context_type: context.type,
          context_id: context.id,
        });
        // After saving to DB, sync from DB to ensure we're always in sync
        const dbContexts = await getConversationContexts(currentConversationId);
        clearContexts(); // Clear local state
        
        // Rebuild from DB to ensure we're always in sync
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
              title: `Loading ${ctx.context_type}...`,
              description: `${ctx.context_type}: ${ctx.context_id}`,
            };
          });
          
          const contexts = await Promise.all(contextPromises);
          contexts.forEach(ctx => addContext(ctx));
        }
      } catch (error) {
        console.error('Failed to save context:', error);
        // Don't add to local state if save failed
        toast({
          title: 'Error',
          description: 'Failed to save context to database',
          variant: 'destructive',
        });
        return; // Exit early if save failed
      }
    } else {
      // If no conversation exists, add to local state (will be saved when conversation is created)
      addContext(contextItem);
    }
    
    setContextPopoverOpen(false);
  };

  const handleRemoveContext = async (contextId: string, contextType: string) => {
    // ALWAYS remove from database first if conversation exists
    if (currentConversationId) {
      try {
        const contexts = await getConversationContexts(currentConversationId);
        const contextToRemove = contexts.find(
          ctx => ctx.context_id === contextId && ctx.context_type === contextType
        );
        
        if (contextToRemove) {
          await removeContextFromConversation(currentConversationId, contextToRemove.id);
          
          // After removing from DB, sync from DB to ensure we're always in sync
          const updatedDbContexts = await getConversationContexts(currentConversationId);
          clearContexts(); // Clear local state
          
          // Rebuild from DB
          if (updatedDbContexts && updatedDbContexts.length > 0) {
            const contextPromises = updatedDbContexts.map(async (ctx: any) => {
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
            contexts.forEach(ctx => addContext(ctx));
          }
        }
      } catch (error) {
        console.error('Failed to remove context:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove context from database',
          variant: 'destructive',
        });
        return; // Exit early if removal failed
      }
    } else {
      // If no conversation exists, just remove from local state
      removeContext(contextId, contextType);
    }
  };

  return (
    <div className="flex-shrink-0 px-4 py-4 bg-card relative pt-8"
    style={{
      background: 'linear-gradient(to bottom, transparent 0%, hsla(var(--card) / 1) 20%, hsla(var(--card) / 1) 100%)'
    }}>
      <AnimatePresence>
        {showAutocomplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main container div with border and rounded corners */}
      <div className="relative bg-muted/20 dark:bg-muted/50 border border-foreground/10 rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        {/* Top section - Context badges */}
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {/* @ badge - Opens popover to search and select contexts */}
          <Popover open={contextPopoverOpen} onOpenChange={setContextPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`flex items-center !text-[16px] justify-center w-8 h-8 !border border-foreground/10 hover:bg-muted-foreground/10 rounded-full text-xs text-foreground/60 font-light transition-colors cursor-pointer ${
                  contextPopoverOpen ? 'bg-muted-foreground/10' : ''
                }`}
                aria-label="Add context"
              >
                @
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 max-w-96 md:w-96 p-1 bg-card/100 border rounded-xl border-foreground/5 !z-[100]"
              align="start"
              side="top"
              sideOffset={4}
            >
              <ContextSearchPopover
                onSelectContext={handleSelectContext}
                selectedContexts={activeContexts.map(ctx => ({ id: ctx.id, type: ctx.type }))}
              />
            </PopoverContent>
          </Popover>
          
          {/* Multiple context badges */}
          {activeContexts.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {activeContexts.map((context) => (
                <div
                  key={`${context.type}-${context.id}`}
                  className="group relative flex items-center gap-1.5 px-2.5 py-1 h-8 border border-foreground/10 rounded-full text-xs text-foreground/80 max-w-[180px] overflow-hidden"
                >
                  <span className="text-sm flex-shrink-0">{context.icon}</span>
                  <span className="font-medium text-sm truncate flex-1">{context.title}</span>
                  {/* X button overlay with gradient background */}
                  <div
                    className="absolute pl-6 right-0 top-0 bottom-0 opacity-0 group-hover:opacity-100 bg-transparent transition-opacity flex items-center justify-end pr-2 pl-6 z-10 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, transparent 0%, hsla(var(--secondary) / 1) 40%, hsla(var(--secondary) / 1) 100%)'
                    }}
                  >
                    <button
                      onClick={() => handleRemoveContext(context.id, context.type)}
                      className="hover:bg-foreground/5 h-6 w-6 rounded-full p-0.5 transition-colors flex-shrink-0 transition-all duration-300"
                      title="Remove context"
                    >
                      <FontAwesomeIcon icon={faX} className="h-3 w-3 text-foreground/70 transition-all duration-300" />
                    </button>
                  </div>
                </div>
              ))}
              {activeContexts.length > 1 && (
                <button
                  onClick={clearContexts}
                  className="px-2 py-1 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                  title="Clear all contexts"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Textarea section */}
        <div className="relative flex items-end gap-0 ml-1 mt-3">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
              onKeyDown={handleKeyDown}
              placeholder="Ask, search, or make anything..."
              disabled={disabled}
              className="flex-1 bg-transparent border-0 resize-none text-sm placeholder:text-muted-foreground focus:outline-none pr-2 mb-2 overflow-y-auto"
              rows={3}
              style={{ minHeight: '72px', maxHeight: '320px', overscrollBehavior: 'none' }} // keep 320px
            />
          
          {/* Send button with full radius */}
          <Button
            size="icon"
            onClick={(e) => {
              if (!value.trim() || disabled) {
                e.preventDefault();
                return;
              }
              onSend();
            }}
            disabled={!value.trim() || disabled}
            className={`h-7 w-7 rounded-full flex-shrink-0 ${
              !value.trim() || disabled
                ? 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted hover:text-muted-foreground'
                : 'bg-primary text-foreground hover:bg-primary/90'
            }`}
          >
            <FontAwesomeIcon icon={faArrowUp} className="text-background !h-3.5 !w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

