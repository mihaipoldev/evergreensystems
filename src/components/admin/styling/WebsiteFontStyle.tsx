import { createClient } from "@/lib/supabase/server";
import { parseFontFamily, generateLandingFontCSS } from "@/lib/font-utils";
import { headers } from "next/headers";
import { getRouteForPathname } from "@/features/funnels/routes";

export async function WebsiteFontStyle() {
  // Determine environment based on NODE_ENV
  const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';

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
  
  // Fallback to database if no cookie
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    // Silently fail - return null to prevent errors
    return null;
  }
  
  // Get website settings with preset join (public read access, no auth required)
  const { data: settings } = await (supabase
    .from("website_settings") as any)
    .select(`
      preset_id,
      website_settings_presets (
        font_family
      )
    `)
    .eq("environment", environment)
    .eq("route", route)
    .maybeSingle();

  let fontFamily = null;

  // Get font_family from preset
  // Supabase returns the joined table as an object (not array) when using single/maybeSingle
  if (settings?.website_settings_presets) {
    const preset = Array.isArray(settings.website_settings_presets) 
      ? settings.website_settings_presets[0] 
      : settings.website_settings_presets;
    fontFamily = preset?.font_family;
  }

  if (!fontFamily) {
    return null;
  }

  const fonts = parseFontFamily(fontFamily);
  const css = generateLandingFontCSS(fonts, pathname);

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
