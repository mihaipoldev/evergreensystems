"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, startTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { PageForm } from "@/features/pages/components/PageForm";
import { PageSectionsList } from "@/features/pages/components/PageSectionsList";
import { getStoredPageTab, setStoredPageTab } from "@/lib/tab-persistence";
import type { Page } from "@/features/pages/types";
import type { Section } from "@/features/sections/types";

type PageTab = "sections" | "edit";

type PageSection = Section & {
  page_section_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
};

type PageContentTabsProps = {
  page: Page;
  initialSections: PageSection[];
};

export function PageContentTabs({ page, initialSections }: PageContentTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine which route we're on and get tab from query params
  const isEditRoute = pathname.endsWith("/edit");
  const isSectionsRoute = pathname.endsWith("/sections");
  
  // Get tab from URL param, localStorage, or default
  const tabParam = searchParams.get("tab") as PageTab | null;
  const storedTab = getStoredPageTab(page.id);
  const defaultTab: PageTab = isEditRoute ? "edit" : "sections";
  const activeTab: PageTab = tabParam || storedTab || defaultTab;

  const sectionsHref = `/admin/pages/${page.id}/sections?tab=sections`;
  const editHref = `/admin/pages/${page.id}/edit?tab=edit`;

  // Local state for optimistic tab UI and loading
  const [pendingTab, setPendingTab] = useState<PageTab | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(!!tabParam); // Initialize based on whether URL already has param

  // Save tab to localStorage when URL param changes, and ensure URL has query param
  useEffect(() => {
    if (!hasInitialized) {
      // On initial load, ensure URL has query param
      if (!tabParam) {
        const targetHref = activeTab === "edit" ? editHref : sectionsHref;
        router.replace(targetHref, { scroll: false });
        // Don't set hasInitialized yet - wait for URL to update
        return;
      }
      // URL has query param, initialization complete
      setHasInitialized(true);
      return;
    }

    if (tabParam) {
      // URL has tab param - save to localStorage if different
      if (tabParam !== storedTab) {
        setStoredPageTab(page.id, tabParam);
      }
    }
  }, [tabParam, activeTab, storedTab, page.id, editHref, sectionsHref, router, hasInitialized]);

  // Determine active tab states
  const isEditTab = activeTab === "edit";
  const isSectionsTab = activeTab === "sections";

  // Use pendingTab for optimistic UI
  const effectiveIsEditTab = pendingTab ? pendingTab === "edit" : isEditTab;

  // Track if we're loading content for tabs (only when user clicks, not on initial load)
  const isTabNavigating = hasInitialized && pendingTab !== null && activeTab !== pendingTab;

  // Show loader after a small delay to avoid flash for fast navigations
  // Never show loader during initialization
  useEffect(() => {
    if (!hasInitialized) {
      setShowLoader(false);
      return;
    }

    let timeout: NodeJS.Timeout;
    if (isTabNavigating) {
      timeout = setTimeout(() => {
        setShowLoader(true);
      }, 50);
    } else {
      setShowLoader(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isTabNavigating, hasInitialized]);

  // Clear pending tab when active tab matches
  useEffect(() => {
    if (pendingTab && activeTab === pendingTab) {
      setPendingTab(null);
    }
  }, [activeTab, pendingTab]);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, tab: PageTab) => {
    e.preventDefault();
    
    // Update UI optimistically for instant feedback
    setPendingTab(tab);
    
    // Save tab preference to localStorage
    setStoredPageTab(page.id, tab);
    
    // Use startTransition for non-urgent navigation update
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  return (
    <div className="w-full relative">
      {/* Simple underlined tab navigation */}
      <nav className="border-b border-border mb-3">
        <div className="flex gap-6">
          <Link
            href={editHref}
            onClick={(e) => handleTabClick(e, editHref, "edit")}
            prefetch={true}
            className={cn(
              "pb-3 text-sm font-medium transition-colors",
              effectiveIsEditTab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Details
          </Link>
          <Link
            href={sectionsHref}
            onClick={(e) => handleTabClick(e, sectionsHref, "sections")}
            prefetch={true}
            className={cn(
              "pb-3 text-sm font-medium transition-colors",
              !effectiveIsEditTab
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sections
          </Link>
        </div>
      </nav>

      {/* Content based on active tab */}
      {isEditTab ? (
        <div className="relative">
          {showLoader && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-3">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="h-8 w-8 text-primary animate-spin" 
                />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          )}
          <PageForm initialData={page} isEdit={true} />
        </div>
      ) : (
        <div className="relative">
          {showLoader && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-3">
                <FontAwesomeIcon 
                  icon={faSpinner} 
                  className="h-8 w-8 text-primary animate-spin" 
                />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          )}
          <PageSectionsList
            pageId={page.id}
            pageTitle={page.title}
            initialSections={initialSections}
            hideHeader={true}
          />
        </div>
      )}
    </div>
  );
}