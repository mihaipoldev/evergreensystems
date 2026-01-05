"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { ChevronDown, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { isPageActive, isViewAllSectionsActive } from "./utils/sidebar-route-matcher";
import { PageSectionItem } from "./PageSectionItem";
import type { Page } from "@/features/page-builder/pages/types";

type PageCollapsibleProps = {
  page: Page;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  pendingPath: string | null;
  searchParams: URLSearchParams;
  startNavigation: (href: string) => void;
  sections: Array<any>;
  siteStructureInfo: Array<{ page_type: string; environment: 'production' | 'development' | 'both' }>;
  manuallyClosedPages: Set<string>;
  clearManuallyClosed: (pageId: string) => void;
};

export function PageCollapsible({
  page,
  isOpen,
  onToggle,
  pathname,
  pendingPath,
  searchParams,
  startNavigation,
  sections,
  siteStructureInfo,
  manuallyClosedPages,
  clearManuallyClosed,
}: PageCollapsibleProps) {
  const sectionsLoading = false; // No longer loading separately
  
  // Auto-open page if we're on a route that belongs to this page
  // But only if the page wasn't manually closed by the user
  useEffect(() => {
    if (isOpen) return; // Already open, no need to check
    if (manuallyClosedPages.has(page.id)) return; // Don't auto-open if manually closed
    
    const currentPath = pendingPath || pathname;
    const queryPageId = searchParams.get("pageId");
    const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "offer", "cta"];
    
    // Check if we're on a content item edit route (e.g., /admin/testimonials/[id]/edit)
    const contentItemRouteMatch = currentPath.match(/\/admin\/(testimonials|faq|features|offer|cta)\/[^/]+\/edit/);
    if (contentItemRouteMatch) {
      // Check if returnTo parameter points to a section on this page
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        // Parse page ID from returnTo URL (new or old structure)
        const newReturnToMatch = returnTo.match(/\/admin\/sections\/[^/?]+.*[?&]pageId=([^&]+)/);
        const oldReturnToMatch = returnTo.match(/\/admin\/pages\/([^/]+)\/sections\/[^/?]+/);
        const returnToPageId = newReturnToMatch?.[1] || oldReturnToMatch?.[1];
        if (returnToPageId === page.id) {
          onToggle();
          return;
        }
      }
      // If no returnTo, check if query param pageId matches this page
      if (queryPageId === page.id) {
        const contentType = contentItemRouteMatch[1];
        // Check if this page has a section of this content type
        const hasMatchingSection = sections.some((section) => (section as any).type === contentType);
        if (hasMatchingSection) {
          onToggle();
          return;
        }
      }
    }
    
    // Check section routes (new URL structure)
    const sectionMatch = currentPath.match(/\/admin\/sections\/([^/]+)/);
    if (sectionMatch) {
      const sectionId = sectionMatch[1];
      // Only auto-open if the pageId query param matches this page
      if (queryPageId === page.id) {
        const hasMatchingSection = sections.some((section) => section.id === sectionId);
        if (hasMatchingSection) {
          onToggle();
          return;
        }
      }
    }
  }, [pathname, pendingPath, sections, isOpen, onToggle, page.id, searchParams, manuallyClosedPages]);

  // Clear manually closed flag when navigating away from this page's sections
  // Use isPageActive to determine if we're still on this page (comprehensive check)
  useEffect(() => {
    const isOnThisPage = isPageActive(page, pathname, pendingPath, searchParams, sections);
    
    // If we're not on this page anymore, clear the manually closed flag
    if (!isOnThisPage && manuallyClosedPages.has(page.id)) {
      clearManuallyClosed(page.id);
    }
  }, [pathname, pendingPath, page, searchParams, sections, manuallyClosedPages, clearManuallyClosed]);

  // Check if we're on this page or any of its sections
  const isPageActiveState = useMemo(() => {
    return isPageActive(page, pathname, pendingPath, searchParams, sections);
  }, [pathname, pendingPath, page, sections, searchParams]);

  const viewAllSectionsHref = `/admin/pages/${page.id}/sections`;
  const isViewAllActiveState = isViewAllSectionsActive(page.id, pathname, pendingPath);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full min-w-0">
      <CollapsibleTrigger
        className={cn(
          "group flex items-center gap-4 rounded-sm px-4 py-2 text-[16px] font-medium w-full",
          "relative overflow-hidden min-w-0",
          "active:scale-[0.98]",
          isPageActiveState
            ? "bg-primary/10 text-sidebar-foreground shadow-sm"
            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-primary/10"
        )}
      >
        <FontAwesomeIcon
          icon={faFile}
          className={cn(
            "h-4 w-4 transition-colors shrink-0",
            isPageActiveState ? "text-primary" : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
          )}
        />
        <span className="relative flex-1 text-left truncate min-w-0">{page.title}</span>
        {siteStructureInfo.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            {siteStructureInfo.map((info) => {
              if (info.environment === 'both') {
                return (
                  <div key={info.page_type} className="flex items-center gap-0.5">
                    <Badge variant="destructive" className="text-[10px] font-semibold px-1 py-0 h-4">
                      Prod
                    </Badge>
                    <Badge className="text-[10px] font-semibold px-1 py-0 h-4 bg-primary text-primary-foreground border-transparent">
                      Dev
                    </Badge>
                  </div>
                );
              } else if (info.environment === 'production') {
                return (
                  <Badge key={info.page_type} variant="destructive" className="text-[10px] font-semibold px-1 py-0 h-4">
                    Prod
                  </Badge>
                );
              } else {
                return (
                  <Badge key={info.page_type} className="text-[10px] font-semibold px-1 py-0 h-4 bg-primary text-primary-foreground border-transparent">
                    Dev
                  </Badge>
                );
              }
            })}
          </div>
        )}
        {isOpen ? (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-all shrink-0 ml-auto",
              isPageActiveState ? "text-primary" : "text-sidebar-foreground/70"
            )}
          />
        ) : (
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-all shrink-0 ml-auto",
              isPageActiveState ? "text-primary" : "text-sidebar-foreground/70"
            )}
          />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pr-6 space-y-0.5 mt-0.5 overflow-hidden">
        {/* Page Settings link */}
        <Link
          href={viewAllSectionsHref}
          onClick={() => startNavigation(viewAllSectionsHref)}
          className={cn(
            "group flex items-center gap-4 rounded-sm px-4 py-2 text-[14px] font-medium",
            "relative overflow-hidden min-w-0",
            "active:scale-[0.98]",
            isViewAllActiveState
              ? "bg-primary/10 text-sidebar-foreground shadow-sm"
              : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-primary/10"
          )}
        >
          <FontAwesomeIcon
            icon={faLayerGroup}
            className={cn(
              "h-4 w-4 transition-colors shrink-0",
              isViewAllActiveState ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
            )}
          />
          <span className="relative flex-1 truncate min-w-0">Page Settings</span>
        </Link>

        {/* Individual section links */}
        {sectionsLoading ? (
          <div className="px-4 py-1.5 text-sm text-muted-foreground">Loading sections...</div>
        ) : (
          sections
            .sort((a, b) => {
              const aPos = (a as any).position ?? 0;
              const bPos = (b as any).position ?? 0;
              return aPos - bPos;
            })
            .map((section) => (
              <PageSectionItem
                key={section.id}
                section={section}
                page={page}
                pathname={pathname}
                pendingPath={pendingPath}
                searchParams={searchParams}
                onNavigate={startNavigation}
              />
            ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

