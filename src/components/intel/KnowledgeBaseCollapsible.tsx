"use client";

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  // Check if we're on any knowledge base page
  const isKnowledgeBaseActive = useMemo(() => {
    const currentPath = pendingPath || pathname;
    return currentPath.startsWith("/intel/knowledge-bases");
  }, [pathname, pendingPath]);

  const knowledgeBasesListHref = "/intel/knowledge-bases";

  return (
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
            icon={faDatabase}
            className={cn(
              "h-4 w-4 transition-colors shrink-0 flex-shrink-0",
              isKnowledgeBaseActive ? "text-primary" : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
            )}
          />
          <span className="relative flex-1 text-left truncate min-w-0" style={{ width: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Knowledge Bases</span>
        </Link>
      </div>
  );
}

