"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarData } from "@/features/page-builder/site-structure/hooks";
import { useSidebarState } from "./sidebar/hooks/useSidebarState";
import { useSidebarNavigation } from "./sidebar/hooks/useSidebarNavigation";
import { useSidebarUser } from "./sidebar/hooks/useSidebarUser";
import { SidebarContent } from "./sidebar/SidebarContent";
import { setSidebarOpenState, useSidebarOpenState } from "./sidebar/SidebarTrigger";
import { getTimestamp, getDuration, debugClientTiming, debugQuery } from "@/lib/debug-performance";
import type { Page } from "@/features/page-builder/pages/types";

export function AdminSidebar() {
  const mountStartTime = useRef<number>(getTimestamp());
  const renderCount = useRef<number>(0);
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  
  const { startNavigation, pendingPath, pathname, getIsNavItemActive, currentPageId } = useSidebarNavigation();
  const { user, loading: userLoading } = useSidebarUser();
  const [isOpen, setIsOpen] = useSidebarOpenState();

  // Fetch all sidebar data in one request (optimized)
  const sidebarDataQueryStartTime = useRef<number>(getTimestamp());
  const { data: sidebarData, isLoading: sidebarDataLoading } = useSidebarData();
  
  // Extract data from combined response
  // Note: pages are minimal (id, title, order) - cast to Page type for compatibility
  const pages: Page[] = (sidebarData?.pages || []).map(p => ({
    ...p,
    description: null,
    type: 'page',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })) as Page[];
  const sectionsByPage = sidebarData?.sectionsByPage || {};
  const pagesLoading = sidebarDataLoading;
  
  // Track sidebar data query completion
  useEffect(() => {
    if (!sidebarDataLoading && sidebarData) {
      const sidebarDataQueryDuration = getDuration(sidebarDataQueryStartTime.current);
      debugQuery("AdminSidebar", "Sidebar data query", sidebarDataQueryDuration, {
        pagesCount: pages.length,
        sectionsPagesCount: Object.keys(sectionsByPage).length,
        isLoading: sidebarDataLoading
      });
    }
  }, [sidebarDataLoading, sidebarData, pages.length, sectionsByPage]);

  // Sidebar state management
  const {
    openPages,
    openSections,
    isInitialized,
    togglePage,
    toggleSection,
    autoOpenPage,
  } = useSidebarState(pages);

  // Auto-open page if we're on a page route
  useEffect(() => {
    if (currentPageId) {
      autoOpenPage(currentPageId);
    }
  }, [currentPageId, autoOpenPage]);

  // Track component mount and renders
  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("AdminSidebar", "Mount", mountDuration);
  }, []);
  
  // Track re-renders
  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current > 1) {
      debugClientTiming("AdminSidebar", `Render #${renderCount.current}`, 0, {
        pagesCount: pages.length,
        openPagesCount: openPages.size,
        isInitialized
      });
    }
  });

  const handleNavigation = (href: string) => {
    startNavigation(href);
    if (isMobile) {
      setIsOpen(false);
      setSidebarOpenState(false);
    }
  };

  const handleHomeClick = () => {
    if (isMobile) {
      setIsOpen(false);
      setSidebarOpenState(false);
    }
  };

  // Desktop: Fixed aside
  if (!isMobile) {
    return (
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-50 border-r border-border/50 bg-sidebar shadow-lg backdrop-blur-sm">
        <SidebarContent
          isMobile={false}
          user={user}
          userLoading={userLoading}
          pages={pages}
          pagesLoading={pagesLoading}
          sectionsByPage={sectionsByPage}
          openPages={openPages}
          openSections={openSections}
          togglePage={togglePage}
          toggleSection={toggleSection}
          getIsActive={getIsNavItemActive}
          onNavigate={handleNavigation}
          pathname={pathname}
          pendingPath={pendingPath}
          searchParams={searchParams}
          onHomeClick={handleHomeClick}
        />
      </aside>
    );
  }

  // Mobile: Sheet drawer
  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      setSidebarOpenState(open);
    }}>
      <SheetContent
        side="left"
        className="w-64 p-0 border-r border-border/50 bg-sidebar shadow-lg backdrop-blur-sm"
      >
        <style jsx global>{`
          [data-radix-dialog-close] {
            display: none !important;
          }
        `}</style>
        <SheetHeader className="px-6 py-5 border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 min-w-0">
              <SheetTitle className="text-lg font-bold leading-tight text-sidebar-foreground tracking-tight">
                Evergreen Sys.
              </SheetTitle>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5 font-medium">
                Admin Panel
              </p>
            </div>
            <Link href="/" onClick={handleHomeClick}>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </SheetHeader>
        <SidebarContent
          isMobile={true}
          user={user}
          userLoading={userLoading}
          pages={pages}
          pagesLoading={pagesLoading}
          sectionsByPage={sectionsByPage}
          openPages={openPages}
          openSections={openSections}
          togglePage={togglePage}
          toggleSection={toggleSection}
          getIsActive={getIsNavItemActive}
          onNavigate={handleNavigation}
          pathname={pathname}
          pendingPath={pendingPath}
          searchParams={searchParams}
          onHomeClick={handleHomeClick}
        />
      </SheetContent>
    </Sheet>
  );
}
