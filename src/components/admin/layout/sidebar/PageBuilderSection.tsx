"use client";

import { SidebarNavSection, SidebarNavItem } from "./SidebarNav";
import { PageCollapsible } from "./PageCollapsible";
import { SIDEBAR_ITEMS } from "./sidebar-items";
import type { Page } from "@/features/page-builder/pages/types";

type PageBuilderSectionProps = {
  isOpen: boolean;
  onToggle: () => void;
  getIsActive: (href: string) => boolean;
  onNavigate: (href: string) => void;
  pages: Page[];
  pagesLoading: boolean;
  sectionsByPage: Record<string, Array<any>>;
  openPages: Set<string>;
  togglePage: (pageId: string) => void;
  pathname: string;
  pendingPath: string | null;
  searchParams: URLSearchParams;
  manuallyClosedPages: Set<string>;
  clearManuallyClosed: (pageId: string) => void;
};

export function PageBuilderSection({
  isOpen,
  onToggle,
  getIsActive,
  onNavigate,
  pages,
  pagesLoading,
  sectionsByPage,
  openPages,
  togglePage,
  pathname,
  pendingPath,
  searchParams,
  manuallyClosedPages,
  clearManuallyClosed,
}: PageBuilderSectionProps) {
  const siteStructureItem = SIDEBAR_ITEMS.find((item) => item.section === 'pageBuilder');

  return (
    <SidebarNavSection title="Page Builder" isOpen={isOpen} onToggle={onToggle}>
      {/* Site Structure */}
      {siteStructureItem && (
        <SidebarNavItem
          item={siteStructureItem}
          isActive={getIsActive(siteStructureItem.href)}
          onNavigate={onNavigate}
        />
      )}

      {/* All pages - dynamic pages with sections */}
      {pagesLoading ? (
        <div className="px-4 py-2 text-sm text-muted-foreground">Loading pages...</div>
      ) : (
        pages.map((page) => (
          <PageCollapsible
            key={page.id}
            page={page}
            isOpen={openPages.has(page.id)}
            onToggle={() => togglePage(page.id)}
            pathname={pathname}
            pendingPath={pendingPath}
            searchParams={searchParams}
            startNavigation={onNavigate}
            sections={sectionsByPage[page.id] || []}
            siteStructureInfo={[]}
            manuallyClosedPages={manuallyClosedPages}
            clearManuallyClosed={clearManuallyClosed}
          />
        ))
      )}
    </SidebarNavSection>
  );
}

