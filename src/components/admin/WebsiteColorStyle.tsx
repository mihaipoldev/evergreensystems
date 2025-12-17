import { createClient } from "@/lib/supabase/server";

export async function WebsiteColorStyle() {
  // ALWAYS check database first - cookies are just for optimization
  // This ensures colors are always loaded from the source of truth
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    // Silently fail - return null to prevent errors
    return null;
  }
  
  // Determine environment based on NODE_ENV
  const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';
  
  // Get website settings with preset join (public read access, no auth required)
  const { data: settings } = await (supabase
    .from("website_settings") as any)
    .select(`
      preset_id,
      website_settings_presets (
        primary_color_h,
        primary_color_s,
        primary_color_l,
        secondary_color_h,
        secondary_color_s,
        secondary_color_l
      )
    `)
    .eq("environment", environment)
    .maybeSingle();

  let primaryColor = null;
  let secondaryColor = null;

  // Get color values directly from preset
  // Supabase returns the joined table as an object (not array) when using single/maybeSingle
  if (settings?.website_settings_presets) {
    const preset = Array.isArray(settings.website_settings_presets) 
      ? settings.website_settings_presets[0] 
      : settings.website_settings_presets;
    
    // Primary color
    if (preset?.primary_color_h !== null && preset?.primary_color_s !== null && preset?.primary_color_l !== null) {
      primaryColor = {
        hsl_h: preset.primary_color_h,
        hsl_s: preset.primary_color_s,
        hsl_l: preset.primary_color_l,
      };
    }
    
    // Secondary color
    if (preset?.secondary_color_h !== null && preset?.secondary_color_s !== null && preset?.secondary_color_l !== null) {
      secondaryColor = {
        hsl_h: preset.secondary_color_h,
        hsl_s: preset.secondary_color_s,
        hsl_l: preset.secondary_color_l,
      };
    }
  }

  if (primaryColor || secondaryColor) {
    return renderColorScript(primaryColor, secondaryColor);
  }

  return null;
}

function renderColorScript(
  primaryColor: { hsl_h: number; hsl_s: number; hsl_l: number } | null,
  secondaryColor: { hsl_h: number; hsl_s: number; hsl_l: number } | null
) {
  // Return style tag - Next.js will move it to head automatically
  // Apply ONLY to landing page preset - NOT to :root to avoid affecting admin
  const cssParts: string[] = [];
  
  if (primaryColor) {
    const hslH = String(primaryColor.hsl_h);
    const hslS = String(primaryColor.hsl_s);
    const hslL = String(primaryColor.hsl_l);
    const primaryValue = `${primaryColor.hsl_h} ${primaryColor.hsl_s}% ${primaryColor.hsl_l}%`;
    cssParts.push(`--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;`);
  }
  
  if (secondaryColor) {
    const secondaryValue = `${secondaryColor.hsl_h} ${secondaryColor.hsl_s}% ${secondaryColor.hsl_l}%`;
    cssParts.push(`--secondary:${secondaryValue}!important;`);
  }
  
  if (cssParts.length === 0) {
    return null;
  }
  
  const cssContent = `.preset-landing-page,.preset-landing-page *,.preset-landing-page.dark,.preset-landing-page.dark *{${cssParts.join('')}}`;
  
  return (
    <style
      id="website-primary-color-inline-server"
      dangerouslySetInnerHTML={{
        __html: cssContent,
      }}
    />
  );
}
