import { getAllFunnelEntries } from "./content";

/**
 * Check whether a pathname corresponds to a funnel route.
 */
export function isFunnelRoute(pathname: string): boolean {
  const entries = getAllFunnelEntries();
  return entries.some(
    (e) => pathname === `/${e.routePath}` || pathname.startsWith(`/${e.routePath}/`)
  );
}

/**
 * Derive the CSS preset class for a given pathname.
 * Funnel pages get `preset-{slug}`, everything else gets `preset-landing-page`.
 */
export function getFunnelPresetClass(pathname: string): string {
  const entries = getAllFunnelEntries();
  const match = entries.find(
    (e) => pathname === `/${e.routePath}` || pathname.startsWith(`/${e.routePath}/`)
  );
  return match ? `preset-${match.slug}` : "preset-landing-page";
}

/**
 * Return the DB route value for a pathname.
 * Funnel pages → `/{routePath}`, everything else → `/`.
 */
export function getRouteForPathname(pathname: string): string {
  const entries = getAllFunnelEntries();
  const match = entries.find(
    (e) => pathname === `/${e.routePath}` || pathname.startsWith(`/${e.routePath}/`)
  );
  return match ? `/${match.routePath}` : "/";
}

/**
 * All route options for admin UI (RouteSelector).
 * Landing page + every registered funnel.
 */
export function getAllRouteOptions(): { value: string; label: string }[] {
  return [
    { value: "/", label: "Landing Page" },
    ...getAllFunnelEntries().map((e) => ({
      value: `/${e.routePath}`,
      label: e.displayName,
    })),
  ];
}
