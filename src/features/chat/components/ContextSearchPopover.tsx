"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faFolder, faBook, faDatabase, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { ContextSearchResult } from '../types';

interface ContextSearchPopoverProps {
  onSelectContext?: (context: ContextSearchResult) => void;
  selectedContexts?: Array<{ id: string; type: string }>;
}

type FilterType = 'document' | 'project' | 'knowledgeBase';

export const ContextSearchPopover = ({ onSelectContext, selectedContexts = [] }: ContextSearchPopoverProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contexts, setContexts] = useState<ContextSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null); // Total count from API
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>('project'); // Default to projects
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);
  const ITEMS_PER_PAGE = 20;

  // Fetch contexts from API
  const fetchContexts = useCallback(async (reset = false, currentPage?: number) => {
    if (reset) {
      setPage(1);
      setLoading(true);
      isLoadingMoreRef.current = false;
    } else {
      setLoadingMore(true);
      isLoadingMoreRef.current = true;
    }

    try {
      const types = activeFilter;
      
      const pageToFetch = currentPage !== undefined ? currentPage : (reset ? 1 : page);
      const response = await fetch(
        `/api/chat/contexts/search?q=${encodeURIComponent(searchQuery)}&types=${types}&page=${pageToFetch}&limit=${ITEMS_PER_PAGE}`
      );
      
      if (!response.ok) {
        console.error('Error fetching contexts:', response.statusText);
        return;
      }
      
      const data = await response.json();
      
      // Update total count (always use the latest total from API)
      setTotalCount(data.total ?? null);
      
      if (reset) {
        setContexts(data.results || []);
        setHasMore(data.hasMore || false);
        // Reset scroll position when resetting
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      } else {
        // Append new items - scroll position will naturally stay the same
        setContexts(prev => [...prev, ...(data.results || [])]);
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Error fetching contexts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [searchQuery, activeFilter, page]);

  // Initial load and when filters change
  useEffect(() => {
    // Don't reset if we're currently loading more
    if (isLoadingMoreRef.current) return;
    
    // Immediately clear contexts and show loading when tab/filter changes
    setContexts([]);
    setTotalCount(null); // Clear total count when switching tabs
    setLoading(true);
    setPage(1); // Reset page when filters change
    
    const timeoutId = setTimeout(() => {
      fetchContexts(true, 1);
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilter]);

  // Load more on scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loadingMore || !hasMore || loading || isLoadingMoreRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // Load more when within 150px of bottom
    if (scrollHeight - scrollTop <= clientHeight + 150) {
      setPage(prev => {
        const nextPage = prev + 1;
        // Trigger fetch immediately
        fetchContexts(false, nextPage);
        return nextPage;
      });
    }
  }, [loadingMore, hasMore, loading, fetchContexts]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Prevent body scroll when scrolling inside popover
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
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
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop <= 1;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      const touch = e.touches[0];
      if (!touch) return;
      
      // Get the element being touched
      const target = e.target as HTMLElement;
      const scrollableElement = target.closest('[data-context-popover-container]') as HTMLElement;
      
      // Only prevent if we're inside the popover container
      if (scrollableElement === container) {
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
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const isSelected = (id: string, type: string) => {
    return selectedContexts.some((ctx) => ctx.id === id && ctx.type === type);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return faFileLines;
      case 'project': return faFolder;
      case 'knowledgeBase': return faDatabase;
      default: return faFileLines;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'document': return 'Document';
      case 'project': return 'Project';
      case 'knowledgeBase': return 'Knowledge Base';
      default: return 'Context';
    }
  };

  const handleContextClick = (context: ContextSearchResult) => {
    if (!isSelected(context.id, context.type)) {
      onSelectContext?.(context);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Search bar */}
      <div className="p-2">
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 rounded-sm bg-muted/20 dark:bg-muted/80 border border-muted-foreground/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:font-bold placeholder:text-[15px]"
          autoFocus
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)} className="w-full">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0 mx-2 mb-2">
          <TabsTrigger value="project" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <FontAwesomeIcon icon={faFolder} className="h-3 w-3 mr-1.5" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="document" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <FontAwesomeIcon icon={faFileLines} className="h-3 w-3 mr-1.5" />
            Docs
          </TabsTrigger>
          <TabsTrigger value="knowledgeBase" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            <FontAwesomeIcon icon={faDatabase} className="h-3 w-3 mr-1.5" />
            KBs
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="project" className="m-0 p-0">
          {/* Results heading */}
          <h3 className="text-sm px-2 mb-1 font-bold text-foreground/70">
            {loading && contexts.length === 0 ? 'Searching...' : totalCount !== null && totalCount > 0 ? `${totalCount} result${totalCount !== 1 ? 's' : ''}` : !loading && contexts.length === 0 ? 'No results' : ''}
          </h3>

          {/* Contexts list with scroll */}
          <div 
            ref={scrollContainerRef}
            data-context-popover-container
            className="flex flex-col gap-0 h-[400px] overflow-y-auto"
            style={{ overscrollBehavior: 'none' }}
          >
        {loading && contexts.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2 min-h-[380px]">
            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}

        {!loading && contexts.length === 0 && searchQuery && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center min-h-[380px] flex items-center justify-center">
            No contexts found for "{searchQuery}"
          </div>
        )}

        {!loading && contexts.length === 0 && !searchQuery && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center min-h-[380px] flex items-center justify-center">
            Start typing to search
          </div>
        )}

        {contexts.map((context, index) => {
          const alreadySelected = isSelected(context.id, context.type);
          return (
            <button
              key={`${context.type}-${context.id}`}
              onClick={() => handleContextClick(context)}
              onMouseEnter={() => setSelectedIndex(index)}
              disabled={alreadySelected}
              className={`w-full flex items-start gap-3 px-2 py-1.5 transition-colors rounded-md text-left ${
                alreadySelected
                  ? 'bg-primary/10 opacity-60 cursor-not-allowed'
                  : selectedIndex === index
                  ? 'bg-muted/60'
                  : 'bg-transparent hover:bg-muted/30'
              }`}
            >
              {/* Context icon */}
              <div className="flex-shrink-0 mt-0.5">
                <FontAwesomeIcon
                  icon={getIcon(context.type)}
                  className={`h-5 w-5 mt-0.5 ${
                    context.type === 'document'
                      ? 'text-blue-500'
                      : context.type === 'project'
                      ? 'text-green-500'
                      : 'text-purple-500'
                  }`}
                />
              </div>

              {/* Context content */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <div className="text-md text-foreground font-medium truncate">
                    {context.title}
                  </div>
                  {alreadySelected && (
                    <span className="text-xs text-primary font-medium flex-shrink-0">(Selected)</span>
                  )}
                </div>
                
                
                {context.metadata && (
                  <div className="text-xs text-muted-foreground/70">
                    {context.metadata}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {loadingMore && (
          <div className="px-3 py-2 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="document" className="m-0 p-0">
          {/* Results heading */}
          <h3 className="text-sm px-2 mb-1 font-bold text-foreground/70">
            {loading && contexts.length === 0 ? 'Searching...' : totalCount !== null && totalCount > 0 ? `${totalCount} result${totalCount !== 1 ? 's' : ''}` : !loading && contexts.length === 0 ? 'No results' : ''}
          </h3>

          {/* Contexts list with scroll */}
          <div 
            ref={scrollContainerRef}
            data-context-popover-container
            className="flex flex-col gap-0 h-[400px] overflow-y-auto"
            style={{ overscrollBehavior: 'none' }}
          >
        {loading && contexts.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2 min-h-[380px]">
            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}

        {!loading && contexts.length === 0 && searchQuery && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center min-h-[380px] flex items-center justify-center">
            No contexts found for "{searchQuery}"
          </div>
        )}

        {!loading && contexts.length === 0 && !searchQuery && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center min-h-[380px] flex items-center justify-center">
            Start typing to search
          </div>
        )}

        {contexts.map((context, index) => {
          const alreadySelected = isSelected(context.id, context.type);
          return (
            <button
              key={`${context.type}-${context.id}`}
              onClick={() => handleContextClick(context)}
              onMouseEnter={() => setSelectedIndex(index)}
              disabled={alreadySelected}
              className={`w-full flex items-start gap-3 px-2 py-1.5 transition-colors rounded-md text-left ${
                alreadySelected
                  ? 'bg-primary/10 opacity-60 cursor-not-allowed'
                  : selectedIndex === index
                  ? 'bg-muted/60'
                  : 'bg-transparent hover:bg-muted/30'
              }`}
            >
              {/* Context icon */}
              <div className="flex-shrink-0 mt-0.5">
                <FontAwesomeIcon
                  icon={getIcon(context.type)}
                  className={`h-5 w-5 mt-0.5 ${
                    context.type === 'document'
                      ? 'text-blue-500'
                      : context.type === 'project'
                      ? 'text-green-500'
                      : 'text-purple-500'
                  }`}
                />
              </div>

              {/* Context content */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <div className="text-md text-foreground font-medium truncate">
                    {context.title}
                  </div>
                  {alreadySelected && (
                    <span className="text-xs text-primary font-medium flex-shrink-0">(Selected)</span>
                  )}
                </div>
                
                
                {context.metadata && (
                  <div className="text-xs text-muted-foreground/70">
                    {context.metadata}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {loadingMore && (
          <div className="px-3 py-2 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
          </div>
        </TabsContent>

        {/* Knowledge Bases Tab */}
        <TabsContent value="knowledgeBase" className="m-0 p-0">
          {/* Results heading */}
          <h3 className="text-sm px-2 mb-1 font-bold text-foreground/70">
            {loading && contexts.length === 0 ? 'Searching...' : totalCount !== null && totalCount > 0 ? `${totalCount} result${totalCount !== 1 ? 's' : ''}` : !loading && contexts.length === 0 ? 'No results' : ''}
          </h3>

          {/* Contexts list with scroll */}
          <div 
            ref={scrollContainerRef}
            data-context-popover-container
            className="flex flex-col gap-0 h-[400px] overflow-y-auto"
            style={{ overscrollBehavior: 'none' }}
          >
        {loading && contexts.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2 min-h-[380px]">
            <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}

        {!loading && contexts.length === 0 && searchQuery && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center min-h-[380px] flex items-center justify-center">
            No contexts found for "{searchQuery}"
          </div>
        )}

        {!loading && contexts.length === 0 && !searchQuery && (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center min-h-[380px] flex items-center justify-center">
            Start typing to search
          </div>
        )}

        {contexts.map((context, index) => {
          const alreadySelected = isSelected(context.id, context.type);
          return (
            <button
              key={`${context.type}-${context.id}`}
              onClick={() => handleContextClick(context)}
              onMouseEnter={() => setSelectedIndex(index)}
              disabled={alreadySelected}
              className={`w-full flex items-start gap-3 px-2 py-1.5 transition-colors rounded-md text-left ${
                alreadySelected
                  ? 'bg-primary/10 opacity-60 cursor-not-allowed'
                  : selectedIndex === index
                  ? 'bg-muted/60'
                  : 'bg-transparent hover:bg-muted/30'
              }`}
            >
              {/* Context icon */}
              <div className="flex-shrink-0 mt-0.5">
                <FontAwesomeIcon
                  icon={getIcon(context.type)}
                  className={`h-5 w-5 mt-0.5 ${
                    context.type === 'document'
                      ? 'text-blue-500'
                      : context.type === 'project'
                      ? 'text-green-500'
                      : 'text-purple-500'
                  }`}
                />
              </div>

              {/* Context content */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <div className="text-md text-foreground font-medium truncate">
                    {context.title}
                  </div>
                  {alreadySelected && (
                    <span className="text-xs text-primary font-medium flex-shrink-0">(Selected)</span>
                  )}
                </div>
                
                
                {context.metadata && (
                  <div className="text-xs text-muted-foreground/70">
                    {context.metadata}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {loadingMore && (
          <div className="px-3 py-2 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
