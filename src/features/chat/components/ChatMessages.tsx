"use client";

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCopy, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { MarkdownRenderer } from '@/features/rag/shared/components';
import { SuggestedQuestions } from './SuggestedQuestions';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '../types';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  showSuggestedQuestions?: boolean;
  onQuestionClick?: (question: string) => void;
  shouldScrollToBottom?: boolean;
}

export const ChatMessages = ({ messages, isTyping, showSuggestedQuestions = false, onQuestionClick, shouldScrollToBottom = false }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const lastMessageCountRef = useRef(messages.length);
  const lastUserMessageIdRef = useRef<string | null>(null);
  const isUserScrollRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const streamingUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamingRafIdRef = useRef<number | null>(null);
  const lastContentLengthRef = useRef(0);
  const hasInitiallyScrolledRef = useRef(false);
  const { toast } = useToast();
  
  // Track likes/dislikes per message
  const [messageFeedback, setMessageFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({});

  // Handle copy event to replace selected text with original markdown
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      // Only intercept if there's selected text
      if (!selectedText.trim()) return;

      // Find the closest message container that contains the selection
      let messageContainer: Node | null = range.commonAncestorContainer;
      
      // Traverse up to find the message container
      while (messageContainer && messageContainer.nodeType !== Node.ELEMENT_NODE) {
        messageContainer = messageContainer.parentNode;
      }
      
      if (messageContainer && messageContainer.nodeType === Node.ELEMENT_NODE) {
        const element = messageContainer as HTMLElement;
        const messageDiv = element.closest('[data-message-id]') as HTMLElement;
        
        if (messageDiv) {
          const messageId = messageDiv.getAttribute('data-message-id');
          const message = messages.find(m => m.id === messageId);
          
          // If it's an assistant message, replace clipboard with original markdown
          if (message && message.role === 'assistant') {
            e.preventDefault();
            e.clipboardData?.setData('text/plain', message.content);
            return;
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('copy', handleCopy);
      return () => {
        container.removeEventListener('copy', handleCopy);
      };
    }
  }, [messages]);

  // Check if user is at/near bottom
  const isNearBottom = (threshold = 150) => {
    if (!containerRef.current) return true;
    const container = containerRef.current;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < threshold;
  };

  const scrollToBottom = (instant = false, force = false) => {
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;

      // If user has scrolled up and we're not forcing, check if they're near bottom
      if (!force && userScrolledUpRef.current) {
        // Only scroll if user is near bottom
        if (!isNearBottom(150)) {
          return; // User scrolled up, don't auto-scroll
        }
        // User is back near bottom, resume auto-scrolling
        userScrolledUpRef.current = false;
      }

      if (instant) {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  };

  // Track user scroll to detect if they manually scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTop = container.scrollTop;
    const handleScroll = () => {
      if (!container) return;
      
      const currentScrollTop = container.scrollTop;
      const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);
      lastScrollTop = currentScrollTop;
      
      // Ignore programmatic scrolls - only react to user scrolls
      // Use a small delay to ensure we catch the scroll event that was just triggered
      if (isProgrammaticScrollRef.current) {
        // Reset flag after a small delay to catch any scroll events from programmatic scroll
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 10);
        return;
      }
      
      // If scroll is very small (< 5px), it might be a programmatic scroll or content growth
      // Only treat significant scrolls as user actions
      if (scrollDelta < 5) {
        return; // Likely not a user scroll
      }
      
      // Mark that user is actively scrolling
      isUserScrollRef.current = true;
      
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Check if user scrolled up (not at bottom)
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      
      // If user is more than 100px from bottom, they've scrolled up
      // Use larger threshold to account for rapid content growth during streaming
      if (distanceFromBottom > 100) {
        userScrolledUpRef.current = true; // User scrolled up - stop all auto-scrolling
      } else {
        // User is at bottom - allow auto-scrolling
        userScrolledUpRef.current = false;
      }
      
      // Reset scroll flag after user stops scrolling
      scrollTimeout = setTimeout(() => {
        isUserScrollRef.current = false;
      }, 200);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // Prevent body scroll when scrolling inside chat window
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // Allow 1px tolerance
      
      // If scrolling up and at top, prevent default to stop body scroll
      if (e.deltaY < 0 && isAtTop) {
        e.preventDefault();
        return;
      }
      
      // If scrolling down and at bottom, prevent default to stop body scroll
      if (e.deltaY > 0 && isAtBottom) {
        e.preventDefault();
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
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop <= 1; // Allow 1px tolerance
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      const touch = e.touches[0];
      if (!touch) return;
      
      // Get the element being touched
      const target = e.target as HTMLElement;
      const scrollableElement = target.closest('[data-chat-messages-container]') as HTMLElement;
      
      // Only prevent if we're inside the chat container
      if (scrollableElement === container) {
        const deltaY = touch.clientY - lastTouchY;
        lastTouchY = touch.clientY;
        
        // If at top and trying to scroll up, prevent
        if (deltaY > 0 && isAtTop) {
          e.preventDefault();
          return;
        }
        
        // If at bottom and trying to scroll down, prevent
        if (deltaY < 0 && isAtBottom) {
          e.preventDefault();
          return;
        }
      }
    };

    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Scroll to bottom on initial load (when messages first appear)
  useEffect(() => {
    if (messages.length > 0 && !hasInitiallyScrolledRef.current && containerRef.current) {
      hasInitiallyScrolledRef.current = true;
      userScrolledUpRef.current = false;
      
      const scrollToBottom = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        isProgrammaticScrollRef.current = true;
        container.scrollTop = container.scrollHeight;
      };
      
      // Immediate scroll
      scrollToBottom();
      
      // Use scrollIntoView immediately
      if (messagesEndRef.current) {
        isProgrammaticScrollRef.current = true;
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
      
      // After layout
      requestAnimationFrame(() => {
        scrollToBottom();
        if (messagesEndRef.current) {
          isProgrammaticScrollRef.current = true;
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      });
      
      // Final check after animations
      setTimeout(() => {
        scrollToBottom();
        if (messagesEndRef.current) {
          isProgrammaticScrollRef.current = true;
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
        
        // Verify we're at bottom
        if (containerRef.current) {
          const distanceFromBottom = containerRef.current.scrollHeight - 
                                    containerRef.current.scrollTop - 
                                    containerRef.current.clientHeight;
          if (distanceFromBottom > 1) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }
      }, 100);
    } else if (messages.length === 0) {
      // Reset flag when messages are cleared
      hasInitiallyScrolledRef.current = false;
    }
     
  }, [messages.length]);

  // Force scroll to absolute bottom when conversation is loaded
  useEffect(() => {
    if (shouldScrollToBottom && messages.length > 0) {
      // Force scroll to absolute bottom when loading a conversation
      userScrolledUpRef.current = false; // Reset scroll state
      
      const scrollToAbsoluteBottom = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        // Force to absolute bottom - set scrollTop to maximum possible value
        isProgrammaticScrollRef.current = true;
        container.scrollTop = container.scrollHeight;
      };
      
      // Wait for DOM to be fully rendered with messages
      // Use double requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToAbsoluteBottom();
          
          // Use scrollIntoView as backup
          if (messagesEndRef.current) {
            isProgrammaticScrollRef.current = true;
            messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
          }
          
          // Wait a bit longer for any animations/transitions to complete
          setTimeout(() => {
            scrollToAbsoluteBottom();
            
            // Use scrollIntoView again
            if (messagesEndRef.current) {
              isProgrammaticScrollRef.current = true;
              messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
            
            // Final verification - ensure we're at absolute bottom
            setTimeout(() => {
              if (containerRef.current) {
                const container = containerRef.current;
                isProgrammaticScrollRef.current = true;
                container.scrollTop = container.scrollHeight;
                
                // Verify we're at absolute bottom
                const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
                if (distanceFromBottom > 1) {
                  // Force one more time if not at bottom
                  container.scrollTop = container.scrollHeight;
                }
              }
              if (messagesEndRef.current) {
                isProgrammaticScrollRef.current = true;
                messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
              }
            }, 50);
          }, 200);
        });
      });
    }
     
  }, [shouldScrollToBottom, messages.length]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const messageCountIncreased = messages.length > lastMessageCountRef.current;
    
    // Check if it's a new user message (user sent something)
    // If count increased AND last message is from user, it's a new user message
    const isNewUserMessage = messageCountIncreased && lastMessage?.role === 'user';
    
    // ALWAYS scroll when user sends a message - ignore any scroll state
    if (isNewUserMessage) {
      // User sent a new message - always scroll to bottom immediately
      userScrolledUpRef.current = false;
      lastUserMessageIdRef.current = lastMessage?.id || null;
      lastMessageCountRef.current = messages.length;
      
      const forceScrollToBottom = () => {
        if (!containerRef.current) return;
        isProgrammaticScrollRef.current = true;
        const container = containerRef.current;
        container.scrollTop = container.scrollHeight;
      };
      
      // Immediate scroll - force scroll right away
      forceScrollToBottom();
      
      // Use scrollIntoView on messagesEndRef for more reliable scrolling
      if (messagesEndRef.current) {
        isProgrammaticScrollRef.current = true;
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
      
      // Then use RAF to catch any DOM updates that haven't happened yet
      requestAnimationFrame(() => {
        forceScrollToBottom();
        if (messagesEndRef.current) {
          isProgrammaticScrollRef.current = true;
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      });
      
      // Double-check after a small delay to ensure DOM is fully updated
      setTimeout(() => {
        forceScrollToBottom();
        if (messagesEndRef.current) {
          isProgrammaticScrollRef.current = true;
          messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
        // Final verification
        if (containerRef.current) {
          const distanceFromBottom = containerRef.current.scrollHeight - 
                                    containerRef.current.scrollTop - 
                                    containerRef.current.clientHeight;
          if (distanceFromBottom > 1) {
            forceScrollToBottom();
          }
        }
      }, 100);
      return;
    }

    // Update message count ref for non-user messages
    if (messageCountIncreased) {
      lastMessageCountRef.current = messages.length;
    }

    // Skip if user is actively scrolling (but not for user messages - already handled above)
    if (isUserScrollRef.current) {
      return;
    }

    // Not typing - only scroll if it's a new message AND user is at bottom
    if (!isTyping && messageCountIncreased) {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      
      // Only scroll if user hasn't scrolled up
      if (distanceFromBottom < 100) {
        isProgrammaticScrollRef.current = true; // Mark as programmatic
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages.length, isTyping]); // Only depend on length - check messages array content inside effect

  // Handle streaming content updates - smooth following during typing
  useEffect(() => {
    // Only handle streaming updates (when typing and content changes)
    if (!isTyping) {
      return; // Not streaming
    }

    // CRITICAL: If user has scrolled up, completely skip - don't interfere with their scrolling
    if (userScrolledUpRef.current) {
      return; // User scrolled up - completely ignore streaming updates, let them scroll freely
    }

    // Track content length to detect actual changes
    const currentContentLength = messages[messages.length - 1]?.content?.length || 0;
    const contentChanged = currentContentLength !== lastContentLengthRef.current;
    
    if (!contentChanged) {
      return; // No content change, skip
    }
    
    lastContentLengthRef.current = currentContentLength;

    // Clear any pending updates
    if (streamingRafIdRef.current !== null) {
      cancelAnimationFrame(streamingRafIdRef.current);
      streamingRafIdRef.current = null;
    }
    if (streamingUpdateTimeoutRef.current) {
      clearTimeout(streamingUpdateTimeoutRef.current);
      streamingUpdateTimeoutRef.current = null;
    }

    // Scroll immediately when content changes during streaming
    // Use requestAnimationFrame to ensure DOM is updated, but don't wait
    // This ensures we catch up as fast as content arrives
    if (!containerRef.current || userScrolledUpRef.current) {
      return () => {
        if (streamingRafIdRef.current !== null) {
          cancelAnimationFrame(streamingRafIdRef.current);
          streamingRafIdRef.current = null;
        }
        if (streamingUpdateTimeoutRef.current) {
          clearTimeout(streamingUpdateTimeoutRef.current);
          streamingUpdateTimeoutRef.current = null;
        }
      };
    }
    
    const container = containerRef.current;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    
    // If user is close to bottom (within 250px), follow the content immediately
    // Use larger threshold to account for rapid content growth during streaming
    // This ensures we keep up even if content grows while we're processing
    if (distanceFromBottom <= 250) {
      // Use requestAnimationFrame for smooth updates, but schedule immediately
      streamingRafIdRef.current = requestAnimationFrame(() => {
        streamingRafIdRef.current = null; // Mark as completed
        
        if (!containerRef.current || userScrolledUpRef.current) return;
        
        const container = containerRef.current;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        
        // Double-check we're still close to bottom (content might have grown)
        if (distanceFromBottom <= 300) {
          // Direct assignment for immediate scroll update
          isProgrammaticScrollRef.current = true; // Mark as programmatic
          container.scrollTop = container.scrollHeight;
        }
      });

      // Also set a fallback timeout (50ms) in case RAF is delayed
      // This ensures we don't miss updates if RAF is blocked
      streamingUpdateTimeoutRef.current = setTimeout(() => {
        if (streamingRafIdRef.current !== null) {
          cancelAnimationFrame(streamingRafIdRef.current);
          streamingRafIdRef.current = null;
        }
        if (!containerRef.current || userScrolledUpRef.current) return;
        
        const container = containerRef.current;
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        
        if (distanceFromBottom <= 300) {
          isProgrammaticScrollRef.current = true;
          container.scrollTop = container.scrollHeight;
        }
        streamingUpdateTimeoutRef.current = null;
      }, 50);
    }

    return () => {
      if (streamingRafIdRef.current !== null) {
        cancelAnimationFrame(streamingRafIdRef.current);
        streamingRafIdRef.current = null;
      }
      if (streamingUpdateTimeoutRef.current) {
        clearTimeout(streamingUpdateTimeoutRef.current);
        streamingUpdateTimeoutRef.current = null;
      }
    };
  }, [messages, isTyping]); // Runs on content updates during streaming, using RAF for smooth updates

  return (
    <div 
      ref={containerRef} 
      data-chat-messages-container
      className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-7 pt-24 pb-4 space-y-4 -mb-8"
      style={{ overscrollBehavior: 'none' }}
    >
      {messages.map((message, index) => {
        const isUserMessage = message.role === 'user';
        const isLatestMessage = index === messages.length - 1;
        const isRecentMessage = index >= messages.length - 3;
        
        // Skip animation delays for user messages and last 3 messages for instant appearance
        const shouldAnimate = !isUserMessage && !isRecentMessage;
        const animationDelay = shouldAnimate ? Math.min((index - (messages.length - 4)) * 0.01, 0.15) : 0; // Max 150ms delay for old messages only
        
        return (
        <motion.div
          key={message.id}
          initial={shouldAnimate ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? { 
            delay: animationDelay,
            duration: 0.2, // Faster animation
            ease: [0.4, 0, 0.2, 1]
          } : { duration: 0 }} // No animation for user/recent messages
          className={`flex gap-3 ${isUserMessage ? 'justify-end' : 'full-width'}`}
          data-message-id={message.id}
        >
          {message.role === 'user' ? (
            <div className="mb-2 max-w-[85%] bg-primary text-background rounded-2xl rounded-br-md px-3.5 py-1.5">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              
              {message.citation && (
                <button className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-80 hover:opacity-100">
                  Source: {message.citation.section}
                </button>
              )}
              
              {message.action && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 h-7 text-xs gap-1.5"
                >
                  <FontAwesomeIcon icon={faPlay} className="h-3 w-3" />
                  {message.action.label}
                </Button>
              )}
            </div>
          ) : (
            <div className="w-full">
              <div 
                className="text-sm text-foreground mb-1 pr-6 [&_.markdown-content]:text-sm [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-[15px] [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:text-[15px] [&_li::marker]:text-[18px]"
                style={{
                  transition: 'opacity 0.2s ease-out'
                }}
              >
                <MarkdownRenderer content={message.content} />
              </div>
              
              {/* Action buttons: Copy, Like, Dislike */}
              <div className="flex items-center gap-1 mb-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(message.content).then(() => {
                      toast({
                        title: 'Copied!',
                        description: 'Message copied to clipboard',
                      });
                    }).catch(() => {
                      toast({
                        title: 'Error',
                        description: 'Failed to copy message',
                        variant: 'destructive',
                      });
                    });
                  }}
                  className="p-2 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-muted-foreground"
                  aria-label="Copy message"
                >
                  <FontAwesomeIcon icon={faCopy} className="h-3.5 w-3.5" />
                </button>
                
                <button
                  onClick={() => {
                    const currentFeedback = messageFeedback[message.id];
                    const newFeedback = currentFeedback === 'like' ? null : 'like';
                    setMessageFeedback(prev => ({ ...prev, [message.id]: newFeedback }));
                    // TODO: Send feedback to API
                  }}
                  className={`p-2 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors ${
                    messageFeedback[message.id] === 'like' 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-muted-foreground'
                  }`}
                  aria-label="Like message"
                >
                  <FontAwesomeIcon icon={faThumbsUp} className="h-3.5 w-3.5" />
                </button>
                
                <button
                  onClick={() => {
                    const currentFeedback = messageFeedback[message.id];
                    const newFeedback = currentFeedback === 'dislike' ? null : 'dislike';
                    setMessageFeedback(prev => ({ ...prev, [message.id]: newFeedback }));
                    // TODO: Send feedback to API
                  }}
                  className={`p-2 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors ${
                    messageFeedback[message.id] === 'dislike' 
                      ? 'text-destructive' 
                      : 'text-muted-foreground hover:text-muted-foreground'
                  }`}
                  aria-label="Dislike message"
                >
                  <FontAwesomeIcon icon={faThumbsDown} className="h-3.5 w-3.5" />
                </button>
              </div>
              
              {message.citation && (
                <button className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-80 hover:opacity-100">
                  Source: {message.citation.section}
                </button>
              )}
              
              {message.action && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 h-7 text-xs gap-1.5"
                >
                  <FontAwesomeIcon icon={faPlay} className="h-3 w-3" />
                  {message.action.label}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      );
      })}
      
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 justify-start"
        >
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" style={{ animationDelay: '400ms' }} />
          </div>
        </motion.div>
      )}
      
      {showSuggestedQuestions && onQuestionClick && (
        <div className="pt-4">
          <SuggestedQuestions onQuestionClick={onQuestionClick} />
        </div>
      )}
      
      {/* Scroll anchor - negative margin to counteract space-y-4 */}
      <div ref={messagesEndRef} className="-mb-4" />
    </div>
  );
};

