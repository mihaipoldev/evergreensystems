"use client";

import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { KnowledgeBaseWithCount } from "@/features/rag/knowledge-bases/data";

type KnowledgeBaseCollapsibleProps = {
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  pendingPath: string | null;
  onNavigate: (href: string) => void;
  getIsActive: (href: string) => boolean;
};

export function KnowledgeBaseCollapsible({
  isOpen,
  onToggle,
  pathname,
  pendingPath,
  onNavigate,
  getIsActive,
}: KnowledgeBaseCollapsibleProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manuallyClosed, setManuallyClosed] = useState(false);

  useEffect(() => {
    async function fetchKnowledgeBases() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/intel/knowledge-base");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch knowledge bases");
        }

        const data = await response.json();
        setKnowledgeBases(data || []);
      } catch (err) {
        console.error("Error fetching knowledge bases:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchKnowledgeBases();
  }, []);

  // Auto-open if we're on a knowledge base detail page (not the list page), but only if not manually closed
  useEffect(() => {
    if (isOpen) return;
    if (manuallyClosed) return; // Don't auto-open if manually closed
    
    const currentPath = pendingPath || pathname;
    // Only auto-open on detail pages (with an ID), not on the list page
    const isOnKnowledgeBaseDetailPage = currentPath.startsWith("/intel/knowledge-bases/") && 
                                        currentPath !== "/intel/knowledge-bases" &&
                                        currentPath !== "/intel/knowledge-bases/";
    
    if (isOnKnowledgeBaseDetailPage) {
      onToggle();
    }
  }, [pathname, pendingPath, isOpen, onToggle, manuallyClosed]);

  // Clear manually closed flag when navigating away from knowledge base pages
  useEffect(() => {
    const currentPath = pendingPath || pathname;
    const isOnKnowledgeBasePage = currentPath.startsWith("/intel/knowledge-bases");
    
    if (!isOnKnowledgeBasePage && manuallyClosed) {
      setManuallyClosed(false);
    }
  }, [pathname, pendingPath, manuallyClosed]);

  // Handle manual toggle - track if user manually closes
  const handleToggle = () => {
    if (isOpen) {
      // User is closing it manually
      setManuallyClosed(true);
    }
    onToggle();
  };

  // Check if we're on any knowledge base page
  const isKnowledgeBaseActive = useMemo(() => {
    const currentPath = pendingPath || pathname;
    return currentPath.startsWith("/intel/knowledge-bases");
  }, [pathname, pendingPath]);

  // Sort knowledge bases alphabetically by name
  const sortedKnowledgeBases = useMemo(() => {
    return [...knowledgeBases].sort((a, b) => a.name.localeCompare(b.name));
  }, [knowledgeBases]);

  const knowledgeBasesListHref = "/intel/knowledge-bases";
  // Only active if we're exactly on the list page, not on a detail page
  const currentPath = pendingPath || pathname;
  const isListActive = currentPath === "/intel/knowledge-bases" || currentPath === "/intel/knowledge-bases/";

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={handleToggle} 
      className="w-full min-w-0"
      style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
    >
      <div
        className={cn(
          "group flex items-center gap-0 rounded-sm px-4 py-2 text-[16px] font-medium w-full",
          "relative overflow-hidden overflow-x-hidden min-w-0 max-w-full",
          isKnowledgeBaseActive
            ? "bg-primary/10 text-sidebar-foreground shadow-sm"
            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-primary/10"
        )}
        style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
      >
        <Link
          href={knowledgeBasesListHref}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(knowledgeBasesListHref);
          }}
          className="flex items-center gap-4 flex-1 min-w-0 max-w-full active:scale-[0.98] overflow-hidden"
          style={{ minWidth: 0, maxWidth: '100%' }}
        >
          <FontAwesomeIcon
            icon={faBook}
            className={cn(
              "h-4 w-4 transition-colors shrink-0 flex-shrink-0",
              isKnowledgeBaseActive ? "text-primary" : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
            )}
          />
          <span className="relative flex-1 text-left truncate min-w-0" style={{ width: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Knowledge Bases</span>
        </Link>
        <CollapsibleTrigger
          className="shrink-0 flex-shrink-0 ml-auto p-1 rounded active:scale-[0.98] group/chevron"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-100 group-hover/chevron:scale-110",
              isOpen ? "rotate-90" : "rotate-180",
              isKnowledgeBaseActive ? "text-primary" : "text-sidebar-foreground/70"
            )}
          />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent 
        className="pl-2 pr-10 space-y-0.5 mt-0.5 overflow-hidden overflow-x-hidden w-full min-w-0 max-w-full border-l border-border/50 ml-4"
        style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
      >
        <div className="space-y-0.5 w-full min-w-0 max-w-full" style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
          {/* Knowledge Bases List link - styled differently */}
          <Link
          href={knowledgeBasesListHref}
          onClick={() => onNavigate(knowledgeBasesListHref)}
          className={cn(
            "group flex items-center gap-3 rounded-sm px-4 py-2 text-[14px] font-semibold w-full",
            "relative overflow-hidden overflow-x-hidden min-w-0 max-w-full",
            "active:scale-[0.98]",
            isListActive
              ? "bg-primary/10 text-sidebar-foreground"
              : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-primary/10"
          )}
          style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
        >
          <FontAwesomeIcon
            icon={faBook}
            className={cn(
              "h-4 w-4 transition-colors shrink-0 flex-shrink-0",
              isListActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
            )}
          />
          <span className="relative flex-1 truncate min-w-0" style={{ width: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>All Knowledge Bases</span>
        </Link>

        {/* Individual knowledge base links */}
        {loading ? (
          <div className="px-4 py-1.5 text-sm text-muted-foreground">Loading knowledge bases...</div>
        ) : error ? (
          <div className="px-4 py-1.5 text-sm text-destructive">{error}</div>
        ) : sortedKnowledgeBases.length === 0 ? (
          <div className="px-4 py-1.5 text-sm text-muted-foreground">No knowledge bases found</div>
        ) : (
          sortedKnowledgeBases.map((kb) => {
            const href = `/intel/knowledge-bases/${kb.id}`;
            const isActive = getIsActive(href);

            return (
              <Link
                key={kb.id}
                href={href}
                onClick={() => onNavigate(href)}
                className={cn(
                  "group flex items-center gap-3 rounded-sm px-4 py-2 text-[14px] font-medium w-full",
                  "relative overflow-hidden overflow-x-hidden min-w-0 max-w-full",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-primary/10 text-sidebar-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-primary/10"
                )}
                style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
              >
                <FontAwesomeIcon
                  icon={faBook}
                  className={cn(
                    "h-4 w-4 transition-colors shrink-0 flex-shrink-0",
                    isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  )}
                />
                <span className="relative flex-1 truncate min-w-0" style={{ width: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kb.name}</span>
              </Link>
            );
          })
        )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

