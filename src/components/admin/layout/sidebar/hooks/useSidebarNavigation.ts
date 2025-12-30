"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";
import { isNavItemActive } from "../utils/sidebar-route-matcher";

export function useSidebarNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startNavigation, pendingPath } = useNavigationLoading();

  // Determine which page should be open based on current route
  // Check query params first (new URL structure), then fall back to pathname (old structure)
  const currentPageId = useMemo(() => {
    // Check query params for pageId (new URL structure: /admin/sections/[id]?pageId=[pageId])
    const queryPageId = searchParams.get("pageId");
    if (queryPageId) {
      return queryPageId;
    }
    // Fall back to old URL structure: /admin/pages/[id]/...
    const match = pathname.match(/\/admin\/pages\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname, searchParams]);

  const getIsNavItemActive = (itemHref: string) => {
    return isNavItemActive(itemHref, pathname, pendingPath);
  };

  return {
    pathname,
    searchParams,
    pendingPath,
    currentPageId,
    startNavigation,
    getIsNavItemActive,
  };
}

