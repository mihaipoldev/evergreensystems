import { headers } from "next/headers";
import { PublicThemeProvider } from "./PublicThemeProvider";
import { getRouteForPathname } from "@/features/funnels/routes";
import { siteLookForRoute } from "@/lib/site-look";

/** The public pages' theme, from the route's look (src/lib/site-look.ts); dark without one. */
export async function PublicThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  // Determine route from headers
  let route = '/';
  try {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
    route = getRouteForPathname(pathname);
  } catch {
    // Default to landing page if headers unavailable
  }

  const theme = siteLookForRoute(route)?.theme ?? "dark";

  return (
    <PublicThemeProvider initialTheme={theme}>
      {children}
    </PublicThemeProvider>
  );
}
