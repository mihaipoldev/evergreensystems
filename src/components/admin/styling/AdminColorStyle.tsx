import { createClient } from "@/lib/supabase/server";
import { getTimestamp, getDuration, debugServerTiming } from "@/lib/debug-performance";

export async function AdminColorStyle() {
  const componentStartTime = getTimestamp();
  
  // ALWAYS check database first - cookies are just for optimization
  // This ensures colors are always loaded from the source of truth
  let supabase;
  const clientStartTime = getTimestamp();
  try {
    supabase = await createClient();
    const clientDuration = getDuration(clientStartTime);
    debugServerTiming("AdminColorStyle", "Supabase client creation", clientDuration);
  } catch (error) {
    const clientDuration = getDuration(clientStartTime);
    debugServerTiming("AdminColorStyle", "Supabase client creation (ERROR)", clientDuration, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Silently fail - return null to prevent errors
    return null;
  }
  
  const authStartTime = getTimestamp();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authDuration = getDuration(authStartTime);
  debugServerTiming("AdminColorStyle", "User authentication", authDuration, { hasUser: !!user });

  if (!user) {
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminColorStyle", "Total (no user)", totalDuration);
    return null;
  }

  // Get settings and theme - always query database
  const settingsQueryStartTime = getTimestamp();
  const { data: settings } = await (supabase
    .from("user_settings") as any)
    .select("active_theme_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const settingsQueryDuration = getDuration(settingsQueryStartTime);
  debugServerTiming("AdminColorStyle", "Settings query", settingsQueryDuration, { 
    hasSettings: !!settings,
    hasThemeId: !!settings?.active_theme_id 
  });

  let color = null;

  let secondaryColor = null;
  let accentColor = null;

  if (settings?.active_theme_id) {
    // Get theme first
    const themeQueryStartTime = getTimestamp();
    const { data: theme } = await (supabase
      .from("user_themes") as any)
      .select("primary_color_id, secondary_color_id, accent_color_id")
      .eq("id", settings.active_theme_id)
      .single();
    const themeQueryDuration = getDuration(themeQueryStartTime);

    if (theme?.primary_color_id) {
      // Get primary color separately to handle missing colors gracefully
      const colorQueryStartTime = getTimestamp();
      const { data: colorData } = await (supabase
        .from("user_colors") as any)
        .select("hsl_h, hsl_s, hsl_l")
        .eq("id", theme.primary_color_id)
        .single();
      const colorQueryDuration = getDuration(colorQueryStartTime);
      
      debugServerTiming("AdminColorStyle", "Theme/color query", themeQueryDuration + colorQueryDuration, {
        hasThemeData: !!theme,
        hasColors: !!colorData
      });

      if (colorData) {
        color = colorData;
      } else {
        // Theme exists but color not found - check Default Theme
        const { data: defaultTheme } = await (supabase
          .from("user_themes") as any)
          .select("id, primary_color_id, secondary_color_id, accent_color_id")
          .eq("user_id", user.id)
          .eq("name", "Default Theme")
          .maybeSingle();

        if (defaultTheme?.primary_color_id) {
          const { data: defaultColor } = await (supabase
            .from("user_colors") as any)
            .select("hsl_h, hsl_s, hsl_l")
            .eq("id", defaultTheme.primary_color_id)
            .single();

          if (defaultColor) {
            color = defaultColor;
          }
        }
      }
    } else {
      debugServerTiming("AdminColorStyle", "Theme/color query", themeQueryDuration, {
        hasThemeData: !!theme,
        hasColors: false
      });
    }

    // Load secondary color
    if (theme?.secondary_color_id) {
      const { data: secondaryColorData } = await (supabase
        .from("user_colors") as any)
        .select("hsl_h, hsl_s, hsl_l")
        .eq("id", theme.secondary_color_id)
        .single();

      if (secondaryColorData) {
        secondaryColor = secondaryColorData;
      }
    }

    // Load accent color
    if (theme?.accent_color_id) {
      const { data: accentColorData } = await (supabase
        .from("user_colors") as any)
        .select("hsl_h, hsl_s, hsl_l")
        .eq("id", theme.accent_color_id)
        .single();

      if (accentColorData) {
        accentColor = accentColorData;
      }
    }
  }

  // Fallback: No active theme - check Default Theme first
  if (!color) {
    const fallbackQueryStartTime = getTimestamp();
    const { data: defaultTheme } = await (supabase
      .from("user_themes") as any)
      .select("id, primary_color_id, secondary_color_id, accent_color_id")
      .eq("user_id", user.id)
      .eq("name", "Default Theme")
      .maybeSingle();

    if (defaultTheme?.primary_color_id) {
      const { data: defaultColor } = await (supabase
        .from("user_colors") as any)
        .select("hsl_h, hsl_s, hsl_l")
        .eq("id", defaultTheme.primary_color_id)
        .single();
      
      const fallbackQueryDuration = getDuration(fallbackQueryStartTime);
      debugServerTiming("AdminColorStyle", "Default Theme query", fallbackQueryDuration, {
        hasDefaultTheme: !!defaultTheme,
        hasColors: !!defaultColor
      });

      if (defaultColor) {
        color = defaultColor;
      }
    } else {
      const fallbackQueryDuration = getDuration(fallbackQueryStartTime);
      debugServerTiming("AdminColorStyle", "Default Theme query", fallbackQueryDuration, {
        hasDefaultTheme: false,
        hasColors: false
      });
    }

    // Load secondary color from default theme if available
    if (defaultTheme?.secondary_color_id && !secondaryColor) {
      const { data: defaultSecondaryColor } = await (supabase
        .from("user_colors") as any)
        .select("hsl_h, hsl_s, hsl_l")
        .eq("id", defaultTheme.secondary_color_id)
        .single();

      if (defaultSecondaryColor) {
        secondaryColor = defaultSecondaryColor;
      }
    }

    // Load accent color from default theme if available
    if (defaultTheme?.accent_color_id && !accentColor) {
      const { data: defaultAccentColor } = await (supabase
        .from("user_colors") as any)
        .select("hsl_h, hsl_s, hsl_l")
        .eq("id", defaultTheme.accent_color_id)
        .single();

      if (defaultAccentColor) {
        accentColor = defaultAccentColor;
      }
    }
  }

  if (color) {
    const primaryValue = `${color.hsl_h} ${color.hsl_s}% ${color.hsl_l}%`;
    // Secondary color is not applied dynamically - it comes from CSS defaults
    const accentValue = accentColor ? `${accentColor.hsl_h} ${accentColor.hsl_s}% ${accentColor.hsl_l}%` : null;
    const renderStartTime = getTimestamp();
    const result = renderColorScript(primaryValue, color.hsl_h, color.hsl_s, color.hsl_l, accentValue, accentColor?.hsl_h, accentColor?.hsl_s, accentColor?.hsl_l);
    const renderDuration = getDuration(renderStartTime);
    debugServerTiming("AdminColorStyle", "Color script render", renderDuration, {
      hsl: primaryValue,
      accentHsl: accentValue
    });
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminColorStyle", "Total", totalDuration);
    return result;
  }

  const totalDuration = getDuration(componentStartTime);
  debugServerTiming("AdminColorStyle", "Total (no color)", totalDuration);
  return null;
}

function renderColorScript(primaryValue: string, h: number, s: number, l: number, accentValue: string | null = null, accentH: number | undefined = undefined, accentS: number | undefined = undefined, accentL: number | undefined = undefined) {
  // Return style tag - Next.js will move it to head automatically
  // The middleware handles blocking script injection for preventing flash
  // This component serves as a fallback to ensure colors are applied
  // Apply ONLY to admin preset - NOT to :root to avoid affecting landing page
  // Note: Secondary color is not applied dynamically - it comes from CSS defaults in globals.css
  const hslH = String(h);
  const hslS = String(s);
  const hslL = String(l);
  let cssContent = `.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;

  // Add accent color if available
  if (accentValue && accentH !== undefined && accentS !== undefined && accentL !== undefined) {
    const accentHslH = String(accentH);
    const accentHslS = String(accentS);
    const accentHslL = String(accentL);
    cssContent += `.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--accent-h:${accentHslH}!important;--accent-s:${accentHslS}!important;--accent-l:${accentHslL}!important;--accent:${accentValue}!important;}`;
  }
  
  return (
    <>
      <style
        id="primary-color-inline-server"
        dangerouslySetInnerHTML={{
          __html: `.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`,
        }}
      />
      {accentValue && accentH !== undefined && accentS !== undefined && accentL !== undefined && (
        <style
          id="accent-color-inline-server"
          dangerouslySetInnerHTML={{
            __html: `.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--accent-h:${accentH}!important;--accent-s:${accentS}!important;--accent-l:${accentL}!important;--accent:${accentValue}!important;}`,
          }}
        />
      )}
    </>
  );
}
