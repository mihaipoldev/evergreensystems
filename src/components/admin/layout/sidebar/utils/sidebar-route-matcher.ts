import type { Page } from "@/features/page-builder/pages/types";

const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "offer", "cta"];

/**
 * Check if a navigation item is active based on current pathname and pending path
 */
export function isNavItemActive(
  itemHref: string,
  pathname: string,
  pendingPath: string | null
): boolean {
  const currentPath = pendingPath || pathname;
  
  // Special handling for Analytics (can have sub-routes)
  if (itemHref === "/admin/analytics") {
    return currentPath === itemHref || currentPath.startsWith("/admin/analytics");
  }
  
  // For other items, check exact match or sub-route
  return currentPath.startsWith(itemHref + "/") || currentPath === itemHref;
}

/**
 * Check if a page is active based on current route
 */
export function isPageActive(
  page: Page,
  pathname: string,
  pendingPath: string | null,
  searchParams: URLSearchParams,
  sections: Array<any>
): boolean {
  const currentPath = pendingPath || pathname;
  
  // Check if we're on a content item edit route (e.g., /admin/testimonials/[id]/edit)
  const contentItemRouteMatch = currentPath.match(/\/admin\/(testimonials|faq|features|offer|cta)\/[^/]+\/edit/);
  if (contentItemRouteMatch) {
    // Check if returnTo parameter points to a section on this page
    const returnTo = searchParams.get('returnTo');
    if (returnTo) {
      // Parse page ID and section ID from returnTo URL (new or old structure)
      // New structure: /admin/sections/[sectionId]?pageId=[pageId]&tab=...
      const newReturnToMatch = returnTo.match(/\/admin\/sections\/([^/?]+).*[?&]pageId=([^&]+)/);
      if (newReturnToMatch && newReturnToMatch[2] === page.id) {
        const sectionId = newReturnToMatch[1];
        return sections.some((section) => section.id === sectionId);
      }
      // Old structure: /admin/pages/[pageId]/sections/[sectionId]?tab=...
      const oldReturnToMatch = returnTo.match(/\/admin\/pages\/([^/]+)\/sections\/([^/?]+)/);
      if (oldReturnToMatch && oldReturnToMatch[1] === page.id) {
        const sectionId = oldReturnToMatch[2];
        return sections.some((section) => section.id === sectionId);
      }
    }
    // Only check if query param pageId matches this page
    if (searchParams.get("pageId") === page.id) {
      const contentType = contentItemRouteMatch[1];
      return sections.some((section) => (section as any).type === contentType);
    }
    return false;
  }
  
  // Check if we're on a section route with this page's pageId in query params
  const isNewSectionRoute = currentPath.startsWith("/admin/sections/");
  const queryPageId = searchParams.get("pageId");
  const isSectionOnThisPage = isNewSectionRoute && queryPageId === page.id;
  
  return (
    currentPath === `/admin/pages/${page.id}/sections` ||
    currentPath.startsWith(`/admin/pages/${page.id}/`) ||
    isSectionOnThisPage ||
    sections.some((section) => {
      const sectionType = (section as any).type;
      const isContentSection = CONTENT_SECTION_TYPES.includes(sectionType);
      const isHeroSection = sectionType === "hero";
      
      // Check new URL structure: /admin/sections/[sectionId]?pageId=[pageId]
      const newSectionPath = `/admin/sections/${section.id}`;
      const isNewSectionPath = currentPath.startsWith(newSectionPath);
      const isSectionWithThisPage = isNewSectionPath && queryPageId === page.id;
      
      // Check old URL structure: /admin/pages/[pageId]/sections/[sectionId]/...
      const oldSectionPath = `/admin/pages/${page.id}/sections/${section.id}`;
      
      if (isContentSection) {
        // For content sections, check new routes and old routes (only if pageId matches)
        return (
          isSectionWithThisPage ||
          currentPath.startsWith(`${oldSectionPath}/items`) ||
          currentPath === `${oldSectionPath}/edit`
        );
      } else if (isHeroSection) {
        // For hero sections, check new routes and old routes (only if pageId matches)
        return (
          isSectionWithThisPage ||
          currentPath === `${oldSectionPath}/media` ||
          currentPath === `${oldSectionPath}/cta` ||
          currentPath === `${oldSectionPath}/edit`
        );
      } else {
        // For other non-content sections, check new routes and old routes (only if pageId matches)
        return (
          isSectionWithThisPage ||
          currentPath === `${oldSectionPath}/edit`
        );
      }
    })
  );
}

/**
 * Check if a section is active based on current route
 */
export function isSectionActive(
  section: any,
  page: Page,
  pathname: string,
  pendingPath: string | null,
  searchParams: URLSearchParams
): boolean {
  const currentPath = pendingPath || pathname;
  const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "offer", "cta", "timeline", "results"];
  const isContentSection = CONTENT_SECTION_TYPES.includes((section as any).type);
  
  // Check new URL structure: /admin/sections/[sectionId]?pageId=[pageId]
  const newSectionPath = `/admin/sections/${section.id}`;
  if (currentPath.startsWith(newSectionPath)) {
    const queryPageId = searchParams.get("pageId");
    // Only mark as active if pageId matches this page
    if (queryPageId === page.id) {
      return true;
    }
  }
  
  // Check old route structure for backward compatibility: /admin/pages/[pageId]/sections/[sectionId]
  const oldSectionBase = `/admin/pages/${page.id}/sections/${section.id}`;
  if (currentPath.startsWith(oldSectionBase)) {
    return true;
  }
  
  // Check content item edit routes (old and new)
  if (isContentSection) {
    const sectionType = (section as any).type;
    const oldContentItemRoutePattern = new RegExp(`^/admin/${sectionType}/[^/]+/edit$`);
    const newContentItemRoutePattern = new RegExp(`^/admin/pages/[^/]+/sections/[^/]+/items/[^/]+/edit$`);
    
    // Check if we're on a content item edit route
    if (oldContentItemRoutePattern.test(currentPath) || newContentItemRoutePattern.test(currentPath)) {
      // Check if returnTo parameter points to this section AND this page
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        // Parse section ID and page ID from returnTo URL (new or old structure)
        // New structure: /admin/sections/[sectionId]?pageId=[pageId]&tab=...
        const newReturnToMatch = returnTo.match(/\/admin\/sections\/([^/?]+).*[?&]pageId=([^&]+)/);
        // Old structure: /admin/pages/[pageId]/sections/[sectionId]?tab=...
        const oldReturnToMatch = returnTo.match(/\/admin\/pages\/([^/]+)\/sections\/([^/?]+)/);
        
        const returnToPageId = newReturnToMatch?.[2] || oldReturnToMatch?.[1];
        const returnToSectionId = newReturnToMatch?.[1] || oldReturnToMatch?.[2];
        
        if (returnToPageId === page.id && returnToSectionId === section.id) {
          return true;
        }
      } else {
        // If no returnTo, check if query param pageId matches this page
        const queryPageId = searchParams.get("pageId");
        if (queryPageId === page.id) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Check if "View All Sections" link is active
 */
export function isViewAllSectionsActive(
  pageId: string,
  pathname: string,
  pendingPath: string | null
): boolean {
  const currentPath = pendingPath || pathname;
  return (
    currentPath === `/admin/pages/${pageId}/sections` ||
    currentPath === `/admin/pages/${pageId}/edit`
  );
}

