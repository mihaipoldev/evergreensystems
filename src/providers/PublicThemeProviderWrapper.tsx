import { createClient } from "@/lib/supabase/server";
import { PublicThemeProvider } from "./PublicThemeProvider";
import { headers } from "next/headers";
import { getRouteForPathname } from "@/features/funnels/routes";

export async function PublicThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  let theme = "dark"; // Default theme

  try {
    const supabase = await createClient();

    // Determine environment based on NODE_ENV
    const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';

    // Determine route from headers
    let route = '/';
    try {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
      route = getRouteForPathname(pathname);
    } catch {
      // Default to landing page if headers unavailable
    }
    
    // Get website settings with preset join (public read access, no auth required)
    const { data: settings } = await (supabase
      .from("website_settings") as any)
      .select(`
        preset_id,
        website_settings_presets (
          theme
        )
      `)
      .eq("environment", environment)
      .eq("route", route)
      .maybeSingle();

    // Get theme from preset
    // Supabase returns the joined table as an object (not array) when using single/maybeSingle
    let presetTheme = null;
    if (settings?.website_settings_presets) {
      const preset = Array.isArray(settings.website_settings_presets) 
        ? settings.website_settings_presets[0] 
        : settings.website_settings_presets;
      presetTheme = preset?.theme;
    }

    if (presetTheme) {
      theme = presetTheme;
    }
  } catch (error) {
    // Silently fail and use default theme
    console.warn("Failed to load website theme:", error);
  }

  return (
    <PublicThemeProvider initialTheme={theme}>
      {children}
    </PublicThemeProvider>
  );
}
