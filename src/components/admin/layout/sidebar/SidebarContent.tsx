"use client";

import { useEffect, useRef, useState } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarUserMenu } from "./SidebarUserMenu";
import { SidebarNavSection, SidebarNavItem } from "./SidebarNav";
import { SIDEBAR_ITEMS } from "./sidebar-items";
import type { SidebarUser, SidebarSection } from "./types";

type SidebarContentProps = {
  isMobile: boolean;
  user: SidebarUser | null;
  userLoading: boolean;
  openSections: Set<string>;
  toggleSection: (sectionId: SidebarSection) => void;
  getIsActive: (href: string) => boolean;
  onNavigate: (href: string) => void;
  onHomeClick?: () => void;
};

export function SidebarContent({
  isMobile,
  user,
  userLoading,
  openSections,
  toggleSection,
  getIsActive,
  onNavigate,
  onHomeClick,
}: SidebarContentProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>>(null);

  // Handle scroll detection for scrollbar visibility
  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollArea) return;

    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    scrollArea.addEventListener('scroll', handleScroll);

    return () => {
      scrollArea.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - only for desktop */}
      {!isMobile && <SidebarHeader onHomeClick={onHomeClick} />}

      {/* Navigation Section */}
      <ScrollAreaPrimitive.Root
        ref={scrollAreaRef}
        className={cn("relative overflow-hidden flex-1 sidebar-scroll-area", isScrolling && "scrolling")}
      >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
          <nav className="px-4 py-4 space-y-2 min-w-0">
            {/* Overview Section */}
            <SidebarNavSection
              title="Overview"
              isOpen={openSections.has('overview')}
              onToggle={() => toggleSection('overview')}
            >
              {SIDEBAR_ITEMS.filter(item => item.section === 'overview').map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  isActive={getIsActive(item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarNavSection>

            {/* Settings Section */}
            <SidebarNavSection
              title="Settings"
              isOpen={openSections.has('settings')}
              onToggle={() => toggleSection('settings')}
            >
              {SIDEBAR_ITEMS.filter(item => item.section === 'settings').map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  isActive={getIsActive(item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarNavSection>
          </nav>
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.ScrollAreaScrollbar
          orientation="vertical"
          className={cn(
            "flex touch-none select-none transition-opacity duration-300",
            "h-full w-2.5 border-l border-l-transparent p-[1px]",
            !isScrolling && "opacity-0 pointer-events-none"
          )}
          style={{
            opacity: isScrolling ? 1 : 0,
            pointerEvents: isScrolling ? 'auto' : 'none',
          }}
        >
          <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>

      {/* User Section */}
      {!userLoading && user && <SidebarUserMenu user={user} />}
    </div>
  );
}
