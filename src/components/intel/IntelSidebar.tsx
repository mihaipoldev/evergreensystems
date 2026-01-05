"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarNavigation } from "@/components/admin/layout/sidebar/hooks/useSidebarNavigation";
import { useSidebarUser } from "@/components/admin/layout/sidebar/hooks/useSidebarUser";
import { IntelSidebarContent } from "./IntelSidebarContent";
import { setSidebarOpenState, useSidebarOpenState } from "@/components/admin/layout/sidebar/SidebarTrigger";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

export function IntelSidebar() {
  const mountStartTime = useRef<number>(getTimestamp());
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  
  const { startNavigation, pendingPath, pathname, getIsNavItemActive } = useSidebarNavigation();
  const { user, loading: userLoading } = useSidebarUser();
  const [isOpen, setIsOpen] = useSidebarOpenState();

  // Track component mount
  useEffect(() => {
    const mountDuration = getDuration(mountStartTime.current);
    debugClientTiming("IntelSidebar", "Mount", mountDuration);
  }, []);

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
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-[60] border-r border-border/50 bg-sidebar shadow-lg backdrop-blur-sm">
        <IntelSidebarContent
          isMobile={false}
          user={user}
          userLoading={userLoading}
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
                Intel Panel
              </p>
            </div>
            <Link href="/" onClick={handleHomeClick}>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-primary/10 hover:text-primary transition-colors rounded-full"
              >
                <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </SheetHeader>
        <IntelSidebarContent
          isMobile={true}
          user={user}
          userLoading={userLoading}
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

