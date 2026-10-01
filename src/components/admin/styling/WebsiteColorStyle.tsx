import { headers } from "next/headers";
import { getRouteForPathname } from "@/features/funnels/routes";
import { siteColorCss, siteLookForRoute } from "@/lib/site-look";

/**
 * The page's brand colours, from its route's look (src/lib/site-look.ts). Admin pages keep their own
 * static colour scheme.
 */
export async function WebsiteColorStyle() {
  // Determine route from headers
  let route = '/';
  let pathname = '/';
  try {
    const headersList = await headers();
    pathname = headersList.get("x-pathname") || headersList.get("referer") || "/";
    route = getRouteForPathname(pathname);
  } catch {
    // Default to landing page if headers unavailable
    pathname = '/';
    route = '/';
  }

  // Skip color injection for admin pages — admin has its own static color scheme
  if (pathname.includes("/admin")) {
    return null;
  }

  const look = siteLookForRoute(route);
  if (!look) {
    return null;
  }

  // Return style tag - Next.js will move it to head automatically
  return (
    <style
      id="website-primary-color-inline-server"
      dangerouslySetInnerHTML={{
        __html: siteColorCss(look, pathname),
      }}
    />
  );
}
