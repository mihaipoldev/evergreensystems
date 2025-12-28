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

  if (settings?.active_theme_id) {
    // Get theme and color in a single query using a join
    const themeQueryStartTime = getTimestamp();
    const { data: themeData } = await (supabase
      .from("user_themes") as any)
      .select(`
        primary_color_id,
        user_colors!inner (
          hsl_h,
          hsl_s,
          hsl_l
        )
      `)
      .eq("id", settings.active_theme_id)
      .single();
    const themeQueryDuration = getDuration(themeQueryStartTime);
    debugServerTiming("AdminColorStyle", "Theme/color query", themeQueryDuration, {
      hasThemeData: !!themeData,
      hasColors: !!(themeData?.user_colors && Array.isArray(themeData.user_colors) && themeData.user_colors.length > 0)
    });

    if (themeData?.user_colors && Array.isArray(themeData.user_colors) && themeData.user_colors.length > 0) {
      color = themeData.user_colors[0];
    }
  }

  // Fallback: No active theme - check if user has colors
  // This handles the first login scenario where user has colors but no theme set
  if (!color) {
    const fallbackQueryStartTime = getTimestamp();
    const { data: userColors } = await (supabase
      .from("user_colors") as any)
      .select("hsl_h, hsl_s, hsl_l")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const fallbackQueryDuration = getDuration(fallbackQueryStartTime);
    debugServerTiming("AdminColorStyle", "Fallback color query", fallbackQueryDuration, {
      hasUserColors: !!userColors
    });

    if (userColors) {
      color = userColors;
    }
  }

  if (color) {
    const primaryValue = `${color.hsl_h} ${color.hsl_s}% ${color.hsl_l}%`;
    const renderStartTime = getTimestamp();
    const result = renderColorScript(primaryValue, color.hsl_h, color.hsl_s, color.hsl_l);
    const renderDuration = getDuration(renderStartTime);
    debugServerTiming("AdminColorStyle", "Color script render", renderDuration, {
      hsl: primaryValue
    });
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminColorStyle", "Total", totalDuration);
    return result;
  }

  const totalDuration = getDuration(componentStartTime);
  debugServerTiming("AdminColorStyle", "Total (no color)", totalDuration);
  return null;
}

function renderColorScript(primaryValue: string, h: number, s: number, l: number) {
  // Return style tag - Next.js will move it to head automatically
  // The middleware handles blocking script injection for preventing flash
  // This component serves as a fallback to ensure colors are applied
  // Apply ONLY to admin preset - NOT to :root to avoid affecting landing page
  const hslH = String(h);
  const hslS = String(s);
  const hslL = String(l);
  const cssContent = `.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;
  
  return (
    <style
      id="primary-color-inline-server"
      dangerouslySetInnerHTML={{
        __html: cssContent,
      }}
    />
  );
}
