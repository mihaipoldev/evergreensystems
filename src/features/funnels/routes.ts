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
 * The CSS preset class a public page wears: the landing page's, on every page, funnels included
 * (POR-608: the whole site has one look). The pathname is kept for callers that pass it.
 */
export function getFunnelPresetClass(_pathname: string): string {
  return "preset-landing-page";
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
