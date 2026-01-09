"use client";

import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faMessage } from '@fortawesome/free-solid-svg-icons';
import { getConversations, type Conversation } from '../services/chat-api';
import { useChatContext } from '../contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const getContextIcon = (contextType: string | null): string => {
  switch (contextType) {
    case 'document':
      return '📄';
    case 'project':
      return '📁';
    case 'knowledgeBase':
      return '📚';
    case 'subject':
      return '🎯';
    default:
      return '💬';
  }
};

export const ChatHistorySelector = () => {
  const { currentConversationId, setCurrentConversationId } = useChatContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  // Prevent body scroll when scrolling inside history selector popover
  useEffect(() => {
    if (!open) return;

    // Lock body scroll when popover is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      
      // Find the popover content (it's rendered in a portal, so we need to search)
      const popoverContent = popoverContentRef.current || 
        document.querySelector('[data-history-selector-container]')?.closest('[role="dialog"]') as HTMLElement;
      const container = scrollContainerRef.current || 
        document.querySelector('[data-history-selector-container]') as HTMLElement;
      
      if (!popoverContent || !container) return;
      
      // Check if the event is inside the popover content
      if (!popoverContent.contains(target)) {
        return; // Let the event pass through normally
      }
      
      // If inside the popover, prevent body scroll
      e.stopPropagation();
      
      // Check scroll boundaries only if inside the scroll container
      if (container.contains(target) || container === target) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        // If at boundaries and trying to scroll further, prevent default as well
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          e.preventDefault();
        }
      }
    };

    let lastTouchY = 0;
    let touchTarget: HTMLElement | null = null;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastTouchY = e.touches[0].clientY;
        touchTarget = e.target as HTMLElement;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchTarget) return;
      
      const popoverContent = popoverContentRef.current || 
        document.querySelector('[data-history-selector-container]')?.closest('[role="dialog"]') as HTMLElement;
      const container = scrollContainerRef.current || 
        document.querySelector('[data-history-selector-container]') as HTMLElement;
      
      if (!popoverContent || !container) return;
      
      if (!popoverContent.contains(touchTarget)) {
        return;
      }
      
      // If inside the scroll container
      if (container.contains(touchTarget) || container === touchTarget) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtTop = scrollTop <= 1;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        const touch = e.touches[0];
        if (!touch) return;
        
        const deltaY = touch.clientY - lastTouchY;
        lastTouchY = touch.clientY;
        
        // If at boundaries and trying to scroll further, prevent
        if ((deltaY > 0 && isAtTop) || (deltaY < 0 && isAtBottom)) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
      
      // Prevent body scroll but allow container scroll
      e.stopPropagation();
    };

    // Use a small delay to ensure the portal has rendered
    const timeoutId = setTimeout(() => {
      // Listen on document to catch all events (including from portal-rendered popover)
      document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('wheel', handleWheel, { capture: true });
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
    };
  }, [open]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      // Sort by updated_at descending (most recent first)
      const sorted = data.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setConversations(sorted);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setOpen(false);
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const displayText = currentConversation?.title || 'New Chat';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/50 justify-between gap-2 min-w-[120px] max-w-[200px]"
        >
          <span className="truncate">{displayText}</span>
          <FontAwesomeIcon icon={faChevronDown} className="!h-2.5 !w-2.5 flex-shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverContentRef}
        className="w-80 p-0 z-[80]" 
        align="start"
        style={{ overscrollBehavior: 'none' }}
      >
        <div 
          ref={scrollContainerRef}
          data-history-selector-container
          className="max-h-[400px] overflow-y-auto scrollbar-thin"
          style={{ overscrollBehavior: 'none' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading conversations...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No conversations yet</div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => handleSelectConversation(convo.id)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group ${
                    currentConversationId === convo.id ? 'bg-muted/30' : ''
                  }`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {getContextIcon(convo.context_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate group-hover:text-primary transition-colors ${
                      currentConversationId === convo.id ? 'text-primary' : 'text-foreground'
                    }`}>
                      {convo.title || 'New Conversation'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(convo.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

