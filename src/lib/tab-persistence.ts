/**
 * Utility functions for persisting tab state in localStorage
 * Used for PageContentTabs and SectionContentTabs
 */

export type PageTab = "sections" | "edit";
export type SectionTab = "faq" | "testimonials" | "features" | "timeline" | "results" | "cta" | "media" | "softwares" | "social-platforms" | "edit";

const PAGE_TAB_STORAGE_PREFIX = "admin-page-tab-";
const SECTION_TAB_STORAGE_PREFIX = "admin-section-tab-";

/**
 * Get the stored tab for a page
 */
export function getStoredPageTab(pageId: string): PageTab | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`${PAGE_TAB_STORAGE_PREFIX}${pageId}`);
  if (stored && (stored === "sections" || stored === "edit")) {
    return stored as PageTab;
  }
  return null;
}

/**
 * Set the stored tab for a page
 */
export function setStoredPageTab(pageId: string, tab: PageTab): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PAGE_TAB_STORAGE_PREFIX}${pageId}`, tab);
}

/**
 * Get the stored tab for a section
 */
export function getStoredSectionTab(sectionId: string): SectionTab | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`${SECTION_TAB_STORAGE_PREFIX}${sectionId}`);
  if (stored && (stored === "faq" || stored === "testimonials" || stored === "features" || stored === "timeline" || stored === "results" || stored === "cta" || stored === "media" || stored === "softwares" || stored === "social-platforms" || stored === "edit")) {
    return stored as SectionTab;
  }
  return null;
}

/**
 * Set the stored tab for a section
 */
export function setStoredSectionTab(sectionId: string, tab: SectionTab): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${SECTION_TAB_STORAGE_PREFIX}${sectionId}`, tab);
}

/**
 * Determine which tab a page route corresponds to
 * Now reads from query params first, then falls back to pathname
 */
export function getPageTabFromPath(pathname: string, searchParams?: URLSearchParams | null): PageTab | null {
  // Check query params first (new approach)
  if (searchParams) {
    const tabParam = searchParams.get("tab");
    if (tabParam === "edit" || tabParam === "sections") {
      return tabParam as PageTab;
    }
  }
  
  // Fallback to pathname (for backward compatibility)
  if (pathname.endsWith("/edit")) {
    return "edit";
  }
  if (pathname.endsWith("/sections")) {
    return "sections";
  }
  return null;
}

/**
 * Determine which tab a section route corresponds to
 * Now reads from query params first, then falls back to pathname
 * @param pathname - The current pathname
 * @param searchParams - The current search params (primary source)
 * @param sectionType - Optional section type to determine default tab (e.g., "hero" defaults to "media")
 */
export function getSectionTabFromPath(
  pathname: string, 
  searchParams?: URLSearchParams | null,
  sectionType?: string
): SectionTab | null {
  // Check query params first (new approach)
  if (searchParams) {
    const tabParam = searchParams.get("tab");
    if (tabParam === "faq" || tabParam === "testimonials" || tabParam === "features" || tabParam === "timeline" || tabParam === "results" || tabParam === "cta" || tabParam === "media" || tabParam === "softwares" || tabParam === "social-platforms" || tabParam === "edit") {
      return tabParam as SectionTab;
    }
    // Backward compatibility: handle old "items" tab param
    if (tabParam === "items") {
      // Map old "items" to section-type-specific tab
      if (sectionType === "faq") return "faq";
      if (sectionType === "testimonials") return "testimonials";
      if (sectionType === "features") return "features";
      if (sectionType === "timeline") return "timeline";
      if (sectionType === "results") return "results";
      if (sectionType === "cta") return "cta";
      return "edit"; // fallback
    }
  }
  
  // Fallback to old URL structure: /admin/pages/[id]/sections/[sectionId]/[tab]
  if (pathname.includes("/pages/") && pathname.includes("/sections/")) {
    if (pathname.endsWith("/edit") && !pathname.includes("/items/")) {
      return "edit";
    }
    if (pathname.endsWith("/items") || pathname.includes("/items/")) {
      // Map old /items/ path to section-type-specific tab
      if (sectionType === "faq") return "faq";
      if (sectionType === "testimonials") return "testimonials";
      if (sectionType === "features") return "features";
      if (sectionType === "timeline") return "timeline";
      if (sectionType === "results") return "results";
      if (sectionType === "cta") return "cta";
      return "edit"; // fallback
    }
    if (pathname.endsWith("/media")) {
      return "media";
    }
    if (pathname.endsWith("/cta")) {
      return "cta";
    }
  }
  
  // Check old URL structure: /admin/sections/[id]/edit
  if (pathname.endsWith("/edit") && pathname.includes("/sections/")) {
    return "edit";
  }
  
  // Determine default based on section type
  if (sectionType === "hero") {
    // Hero sections default to media tab
    return "media";
  }
  if (sectionType === "header") {
    // Header sections default to cta tab
    return "cta";
  }
  if (sectionType === "logos") {
    // Logos sections default to softwares tab
    return "softwares";
  }
  if (sectionType === "footer") {
    // Footer sections default to social-platforms tab
    return "social-platforms";
  }
  if (sectionType === "faq") {
    return "faq";
  }
  if (sectionType === "testimonials") {
    return "testimonials";
  }
  if (sectionType === "features") {
    return "features";
  }
  if (sectionType === "timeline") {
    return "timeline";
  }
  if (sectionType === "results") {
    return "results";
  }
  if (sectionType === "cta") {
    return "cta";
  }
  // Default to edit for other sections
  return "edit";
}
