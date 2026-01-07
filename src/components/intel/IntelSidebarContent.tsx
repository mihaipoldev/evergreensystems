"use client";

import { useEffect, useRef, useState } from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "@/components/admin/layout/sidebar/SidebarHeader";
import { SidebarUserMenu } from "@/components/admin/layout/sidebar/SidebarUserMenu";
import { SidebarNavSection, SidebarNavItem } from "@/components/admin/layout/sidebar/SidebarNav";
import { INTEL_SIDEBAR_ITEMS } from "./intel-sidebar-items";
import { KnowledgeBaseCollapsible } from "./KnowledgeBaseCollapsible";
import { ProjectCollapsible } from "./ProjectCollapsible";
import type { SidebarUser } from "@/components/admin/layout/sidebar/types";

type IntelSidebarContentProps = {
  isMobile: boolean;
  user: SidebarUser | null;
  userLoading: boolean;
  getIsActive: (href: string) => boolean;
  onNavigate: (href: string) => void;
  pathname: string;
  pendingPath: string | null;
  searchParams: URLSearchParams;
  onHomeClick?: () => void;
};

export function IntelSidebarContent({
  isMobile,
  user,
  userLoading,
  getIsActive,
  onNavigate,
  pathname,
  pendingPath,
  searchParams,
  onHomeClick,
}: IntelSidebarContentProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>>(null);

  // Handle scroll detection for scrollbar visibility
  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollArea) return;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Hide scrollbar after scrolling stops
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

  // Simple state for sections (overview, admin, and settings for Intel)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview', 'admin', 'settings']));
  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // State for knowledge bases expandable (like pages in admin)
  const [isKnowledgeBasesOpen, setIsKnowledgeBasesOpen] = useState(false);
  // State for projects expandable - persisted in localStorage
  const [isProjectsOpen, setIsProjectsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("intel-sidebar-projects-open");
    return stored === "true";
  });

  // Persist projects open state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("intel-sidebar-projects-open", String(isProjectsOpen));
    }
  }, [isProjectsOpen]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - only for desktop */}
      {!isMobile && <SidebarHeader onHomeClick={onHomeClick} subtitle="Intel Panel" />}

      {/* Navigation Section */}
      <ScrollAreaPrimitive.Root
        ref={scrollAreaRef}
        className={cn("relative overflow-hidden flex-1 sidebar-scroll-area", isScrolling && "scrolling")}
      >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] overflow-x-hidden">
          <nav className="px-4 py-4 space-y-2 min-w-0 overflow-x-hidden">
            {/* Overview Section */}
            <SidebarNavSection
              title="Overview"
              isOpen={openSections.has('overview')}
              onToggle={() => toggleSection('overview')}
            >
              {INTEL_SIDEBAR_ITEMS.filter(item => item.section === 'overview').map((item) => {
                // Replace Projects item with expandable collapsible
                if (item.href === "/intel/projects") {
                  return (
                    <ProjectCollapsible
                      key={item.href}
                      isOpen={isProjectsOpen}
                      onToggle={() => setIsProjectsOpen(!isProjectsOpen)}
                      pathname={pathname}
                      pendingPath={pendingPath}
                      searchParams={searchParams}
                      onNavigate={onNavigate}
                      getIsActive={getIsActive}
                    />
                  );
                }
                return (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={getIsActive(item.href)}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </SidebarNavSection>

            {/* Admin Section */}
            <SidebarNavSection
              title="Admin"
              isOpen={openSections.has('admin')}
              onToggle={() => toggleSection('admin')}
            >
              {INTEL_SIDEBAR_ITEMS.filter(item => item.section === 'admin').map((item) => {
                // Replace Knowledge Bases item with expandable collapsible
                if (item.href === "/intel/knowledge-bases") {
                  return (
                    <KnowledgeBaseCollapsible
                      key={item.href}
                      isOpen={isKnowledgeBasesOpen}
                      onToggle={() => setIsKnowledgeBasesOpen(!isKnowledgeBasesOpen)}
                      pathname={pathname}
                      pendingPath={pendingPath}
                      onNavigate={onNavigate}
                      getIsActive={getIsActive}
                    />
                  );
                }
                return (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={getIsActive(item.href)}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </SidebarNavSection>

            {/* Settings Section */}
            <SidebarNavSection
              title="Settings"
              isOpen={openSections.has('settings')}
              onToggle={() => toggleSection('settings')}
            >
              {INTEL_SIDEBAR_ITEMS.filter(item => item.section === 'settings').map((item) => (
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

