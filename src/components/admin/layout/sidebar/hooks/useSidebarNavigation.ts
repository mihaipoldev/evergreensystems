"use client";

import { usePathname } from "next/navigation";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";
import { isNavItemActive } from "../utils/sidebar-route-matcher";

export function useSidebarNavigation() {
  const pathname = usePathname();
  const { startNavigation, pendingPath } = useNavigationLoading();

  const getIsNavItemActive = (itemHref: string) => {
    return isNavItemActive(itemHref, pathname, pendingPath);
  };

  return {
    pathname,
    pendingPath,
    startNavigation,
    getIsNavItemActive,
  };
}

