import { headers } from "next/headers";
import { generateLandingFontCSS, getDefaultFontFamily } from "@/lib/font-utils";
import { getRouteForPathname } from "@/features/funnels/routes";
import { siteLookForRoute } from "@/lib/site-look";

/** The public pages' fonts, from the route's look (src/lib/site-look.ts). */
export async function WebsiteFontStyle() {
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

  const look = siteLookForRoute(route);
  if (!look) {
    return null;
  }

  const css = generateLandingFontCSS(
    { admin: getDefaultFontFamily().admin, landing: look.fonts },
    pathname
  );
  if (!css) {
    return null;
  }

  return (
    <style
      id="landing-font-family-inline-server"
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />
  );
}
