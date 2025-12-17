import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { parseFontFamily, generateLandingFontCSS } from "@/lib/font-utils";

export async function WebsiteFontStyle() {
  // Determine environment based on NODE_ENV
  const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';
  
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
  const css = generateLandingFontCSS(fonts);

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
