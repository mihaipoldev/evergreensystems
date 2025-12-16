import { createClient } from "@/lib/supabase/server";

export async function AdminColorStyle() {
  // ALWAYS check database first - cookies are just for optimization
  // This ensures colors are always loaded from the source of truth
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    // Silently fail - return null to prevent errors
    return null;
  }
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get settings and theme - always query database
  const { data: settings } = await (supabase
    .from("user_settings") as any)
    .select("active_theme_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let color = null;

  if (settings?.active_theme_id) {
    // Get theme and color in a single query using a join
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

    if (themeData?.user_colors && Array.isArray(themeData.user_colors) && themeData.user_colors.length > 0) {
      color = themeData.user_colors[0];
    }
  }

  // Fallback: No active theme - check if user has colors
  // This handles the first login scenario where user has colors but no theme set
  if (!color) {
    const { data: userColors } = await (supabase
      .from("user_colors") as any)
      .select("hsl_h, hsl_s, hsl_l")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (userColors) {
      color = userColors;
    }
  }

  if (color) {
    const primaryValue = `${color.hsl_h} ${color.hsl_s}% ${color.hsl_l}%`;
    return renderColorScript(primaryValue, color.hsl_h, color.hsl_s, color.hsl_l);
  }

  return null;
}

function renderColorScript(primaryValue: string, h: number, s: number, l: number) {
  // Return style tag - Next.js will move it to head automatically
  // The middleware handles blocking script injection for preventing flash
  // This component serves as a fallback to ensure colors are applied
  const hslH = String(h);
  const hslS = String(s);
  const hslL = String(l);
  const cssContent = `:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;
  
  return (
    <style
      id="primary-color-inline-server"
      dangerouslySetInnerHTML={{
        __html: cssContent,
      }}
    />
  );
}
