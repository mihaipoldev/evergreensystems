"use client";

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faClockRotateLeft, faPlus, faMessage, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { getConversations, deleteConversation, type Conversation } from '../services/chat-api';
import { useChatContext } from '../contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onConversationSelect?: (id: string) => void;
}

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

const groupConversationsByDate = (conversations: Conversation[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { label: string; conversations: Conversation[] }[] = [
    { label: 'Today', conversations: [] },
    { label: 'This Week', conversations: [] },
    { label: 'Older', conversations: [] },
  ];

  conversations.forEach((conv) => {
    const updatedAt = new Date(conv.updated_at);
    if (updatedAt >= today) {
      groups[0].conversations.push(conv);
    } else if (updatedAt >= weekAgo) {
      groups[1].conversations.push(conv);
    } else {
      groups[2].conversations.push(conv);
    }
  });

  return groups.filter((group) => group.conversations.length > 0);
};

export const ChatHistoryPanel = ({ isOpen, onClose, onNewChat, onConversationSelect }: ChatHistoryPanelProps) => {
  const { setCurrentConversationId, currentConversationId } = useChatContext();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Prevent body scroll when scrolling inside history panel
  useEffect(() => {
    if (!isOpen) return;

    const container = scrollContainerRef.current;
    const modalContent = modalContentRef.current;
    const overlay = overlayRef.current;
    if (!container || !modalContent || !overlay) return;

    // Lock body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      
      // If target is the overlay (backdrop), prevent all scrolling
      if (!modalContent.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // If target is inside the scroll container
      if (container.contains(target)) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        // If at boundaries and trying to scroll further, prevent body scroll
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          e.preventDefault();
          e.stopPropagation();
        }
        // Otherwise, let the container scroll naturally - CSS overscrollBehavior handles the rest
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
      if (!touchTarget || !modalContent.contains(touchTarget)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // If target is inside the scroll container
      if (container.contains(touchTarget)) {
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
        }
      }
    };

    // Listen on document to catch all events
    document.addEventListener('wheel', handleWheel, { passive: false });
    overlay.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('wheel', handleWheel);
      overlay.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    if (onConversationSelect) {
      onConversationSelect(id);
    }
    onClose();
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteConversation(id);
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
      }
      toast({
        title: 'Success',
        description: 'Conversation deleted',
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete conversation',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[80] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      style={{ overscrollBehavior: 'none' }}
    >
      <motion.div
        ref={modalContentRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-card border border-border rounded-xl chat-shadow-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: 'none' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClockRotateLeft} className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Chat History</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <FontAwesomeIcon icon={faX} className="h-4 w-4" />
          </Button>
        </div>

        <div 
          ref={scrollContainerRef}
          data-chat-history-container
          className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6"
          style={{ overscrollBehavior: 'none' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading conversations...</div>
            </div>
          ) : groupedConversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No conversations yet</div>
            </div>
          ) : (
            groupedConversations.map((group) => (
              <div key={group.label}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  {group.label}
                </h4>
                <div className="space-y-2">
                  {group.conversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={`relative w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group ${
                        currentConversationId === convo.id ? 'bg-muted/30' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleSelectConversation(convo.id)}
                        className="flex-1 flex items-start gap-3 min-w-0"
                      >
                        <span className="text-lg flex-shrink-0">
                          {getContextIcon(convo.context_type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {convo.title || 'New Conversation'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <FontAwesomeIcon icon={faMessage} className="h-3 w-3" />
                            <span>{convo.message_count || 0} messages</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(convo.updated_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(e, convo.id)}
                        disabled={deletingId === convo.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded text-destructive flex-shrink-0"
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="h-3.5 w-3.5"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border flex-shrink-0">
          <Button onClick={onNewChat} className="w-full gap-2">
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

