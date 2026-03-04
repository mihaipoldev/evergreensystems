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
