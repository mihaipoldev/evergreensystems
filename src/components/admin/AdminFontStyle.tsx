import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { parseFontFamily, generateFontCSS } from "@/lib/font-utils";
import { getTimestamp, getDuration, debugServerTiming } from "@/lib/debug-performance";

export async function AdminFontStyle() {
  const componentStartTime = getTimestamp();
  
  // First, check cookie for instant access (no DB query needed)
  const cookieCheckStartTime = getTimestamp();
  let cookieFonts: { value: string } | undefined;
  try {
    const cookieStore = await cookies();
    cookieFonts = cookieStore.get("font-family-json");
    const cookieCheckDuration = getDuration(cookieCheckStartTime);
    debugServerTiming("AdminFontStyle", "Cookie check", cookieCheckDuration, { hasCookie: !!cookieFonts?.value });
  } catch (error) {
    const cookieCheckDuration = getDuration(cookieCheckStartTime);
    debugServerTiming("AdminFontStyle", "Cookie check (ERROR)", cookieCheckDuration, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Silently ignore cookie errors - fall back to database
  }

  if (cookieFonts?.value) {
    try {
      const parseStartTime = getTimestamp();
      const fonts = parseFontFamily(cookieFonts.value);
      const css = generateFontCSS(fonts);
      const parseDuration = getDuration(parseStartTime);
      debugServerTiming("AdminFontStyle", "Font parse & CSS gen (cookie)", parseDuration, {
        source: 'cookie',
        heading: fonts.admin?.heading,
        body: fonts.admin?.body
      });
      const totalDuration = getDuration(componentStartTime);
      debugServerTiming("AdminFontStyle", "Total (cookie)", totalDuration);
      return (
        <style
          id="font-family-inline-server"
          dangerouslySetInnerHTML={{
            __html: css,
          }}
        />
      );
    } catch (error) {
      const parseDuration = getDuration(getTimestamp());
      debugServerTiming("AdminFontStyle", "Font parse (cookie ERROR)", parseDuration, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Invalid cookie format - fall back to database
    }
  }

  // Fallback to database if no cookie
  const dbStartTime = getTimestamp();
  let supabase;
  try {
    supabase = await createClient();
    const clientDuration = getDuration(dbStartTime);
    debugServerTiming("AdminFontStyle", "Supabase client creation", clientDuration);
  } catch (error) {
    const clientDuration = getDuration(dbStartTime);
    debugServerTiming("AdminFontStyle", "Supabase client creation (ERROR)", clientDuration, {
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
  debugServerTiming("AdminFontStyle", "User authentication", authDuration, { hasUser: !!user });

  if (!user) {
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminFontStyle", "Total (no user)", totalDuration);
    return null;
  }

  // Get settings and theme
  const settingsQueryStartTime = getTimestamp();
  const { data: settings } = await (supabase
    .from("user_settings") as any)
    .select("active_theme_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const settingsQueryDuration = getDuration(settingsQueryStartTime);
  debugServerTiming("AdminFontStyle", "Settings query", settingsQueryDuration, {
    hasSettings: !!settings,
    hasThemeId: !!settings?.active_theme_id
  });

  if (!settings?.active_theme_id) {
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminFontStyle", "Total (no theme)", totalDuration);
    return null;
  }

  // Get theme with font_family
  const themeQueryStartTime = getTimestamp();
  const { data: theme } = await (supabase
    .from("user_themes") as any)
    .select("font_family")
    .eq("id", settings.active_theme_id)
    .single();
  const themeQueryDuration = getDuration(themeQueryStartTime);
  debugServerTiming("AdminFontStyle", "Theme query", themeQueryDuration, {
    hasTheme: !!theme,
    hasFontFamily: !!theme?.font_family
  });

  if (!theme?.font_family) {
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminFontStyle", "Total (no font family)", totalDuration);
    return null;
  }

  const parseStartTime = getTimestamp();
  const fonts = parseFontFamily(theme.font_family);
  const css = generateFontCSS(fonts);
  const parseDuration = getDuration(parseStartTime);
  debugServerTiming("AdminFontStyle", "Font parse & CSS gen (database)", parseDuration, {
    source: 'database',
    heading: fonts.admin?.heading,
    body: fonts.admin?.body
  });

  const totalDuration = getDuration(componentStartTime);
  debugServerTiming("AdminFontStyle", "Total (database)", totalDuration);

  return (
    <style
      id="font-family-inline-server"
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />
  );
}

