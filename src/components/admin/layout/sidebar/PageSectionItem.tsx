"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { getSectionTabWithDefault } from "@/lib/tab-persistence";
import { isSectionActive } from "./utils/sidebar-route-matcher";
import type { Page } from "@/features/page-builder/pages/types";

type PageSectionItemProps = {
  section: any;
  page: Page;
  pathname: string;
  pendingPath: string | null;
  searchParams: URLSearchParams;
  onNavigate: (href: string) => void;
};

export function PageSectionItem({
  section,
  page,
  pathname,
  pendingPath,
  searchParams,
  onNavigate,
}: PageSectionItemProps) {
  const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "offer", "cta", "timeline", "results"];
  const isContentSection = CONTENT_SECTION_TYPES.includes((section as any).type);
  
  // Determine section href using stored tab preference or default
  const sectionBase = `/admin/sections/${section.id}`;
  const sectionType = (section as any).type;
  const tab = getSectionTabWithDefault(section.id, sectionType);
  const sectionHref = `${sectionBase}?pageId=${page.id}&tab=${tab}`;
  
  const isSectionActiveState = isSectionActive(section, page, pathname, pendingPath, searchParams);

  return (
    <Link
      href={sectionHref}
      onClick={() => onNavigate(sectionHref)}
      className={cn(
        "group flex items-center gap-4 rounded-sm px-4 py-2 text-[14px] font-medium",
        "relative overflow-hidden min-w-0",
        "active:scale-[0.98]",
        isSectionActiveState
          ? "bg-primary/10 text-sidebar-foreground shadow-sm"
          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-primary/10"
      )}
    >
      <IconFromClass
        iconClass={(section as any).icon || null}
        fallbackIcon={faLayerGroup}
        className={cn(
          "h-4 w-4 transition-colors shrink-0",
          isSectionActiveState
            ? "text-primary"
            : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
        )}
      />
      <span className="relative flex-1 truncate min-w-0">
        {section.admin_title || section.title || section.type}
      </span>
    </Link>
  );
}

