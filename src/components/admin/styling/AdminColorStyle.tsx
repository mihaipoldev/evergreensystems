import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { getTimestamp, getDuration, debugServerTiming } from "@/lib/debug-performance";

export async function AdminColorStyle() {
  console.log('[COLOR DEBUG] ===== AdminColorStyle (SERVER) - COMPONENT CALLED =====');
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
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Supabase client creation failed, checking cookies as fallback...');
    // Even if Supabase fails, try to inject colors from cookies to prevent default CSS flash
    try {
      // Parse cookies manually from headers
      const headersList = await headers();
      const cookieHeader = headersList.get('cookie') || '';
      
      const parseCookie = (name: string): string | null => {
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        if (match && match[1]) {
          // Return raw value - HSL colors are NOT URL-encoded
          return match[1].trim();
        }
        return null;
      };
      
      const cookieColor = parseCookie('primary-color-hsl');
      const cookieAccentColor = parseCookie('accent-color-hsl');
      
      // Cookies are already decoded by parseCookie
      if (cookieColor) {
        const hslMatch = cookieColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]);
          const s = parseInt(hslMatch[2]);
          const l = parseInt(hslMatch[3]);
          const primaryValue = cookieColor;
          
          let accentValue: string | null = null;
          let accentH: number | undefined = undefined;
          let accentS: number | undefined = undefined;
          let accentL: number | undefined = undefined;
          
          if (cookieAccentColor) {
            const accentHslMatch = cookieAccentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
            if (accentHslMatch) {
              accentH = parseInt(accentHslMatch[1]);
              accentS = parseInt(accentHslMatch[2]);
              accentL = parseInt(accentHslMatch[3]);
              accentValue = cookieAccentColor;
            }
          }
          
          console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ✅ Supabase failed but found valid colors in cookies, injecting...');
          return renderColorScript(primaryValue, h, s, l, accentValue, accentH, accentS, accentL);
        }
      }
    } catch (e) {
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Error reading cookies (Supabase failed):', e);
    }
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
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ⚠️ No user authenticated, but will try to inject colors from cookies anyway...');
    // Even without user, try to inject colors from cookies to prevent default CSS flash
    try {
      // CRITICAL: Next.js's cookies() parser fails on URL-encoded cookie values
      // Parse cookies manually from headers instead
      const headersList = await headers();
      const cookieHeader = headersList.get('cookie') || '';
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Raw cookie header:', cookieHeader.substring(0, 200));
      
      // Parse cookies manually
      const parseCookie = (name: string): string | null => {
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        if (match && match[1]) {
          // Return raw value - HSL colors are NOT URL-encoded to avoid Next.js cookie parser issues
          return match[1].trim();
        }
        return null;
      };
      
      // Get raw cookie values - they might be URL-encoded
      const cookieColor = parseCookie('primary-color-hsl');
      const cookieAccentColor = parseCookie('accent-color-hsl');
      
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Parsed cookie values:', {
        primary: cookieColor || 'NOT FOUND',
        accent: cookieAccentColor || 'NOT FOUND'
      });
      
      // Cookies are already decoded by parseCookie helper
      if (cookieColor) {
        const hslMatch = cookieColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]);
          const s = parseInt(hslMatch[2]);
          const l = parseInt(hslMatch[3]);
          const primaryValue = cookieColor;
          
          let accentValue: string | null = null;
          let accentH: number | undefined = undefined;
          let accentS: number | undefined = undefined;
          let accentL: number | undefined = undefined;
          
          if (cookieAccentColor) {
            const accentHslMatch = cookieAccentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
            if (accentHslMatch) {
              accentH = parseInt(accentHslMatch[1]);
              accentS = parseInt(accentHslMatch[2]);
              accentL = parseInt(accentHslMatch[3]);
              accentValue = cookieAccentColor;
            }
          }
          
          console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ✅ No user but found valid colors in cookies, injecting...');
          return renderColorScript(primaryValue, h, s, l, accentValue, accentH, accentS, accentL);
        } else {
          console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Cookie found but HSL pattern did not match:', cookieColor);
        }
      } else {
        console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - No primary color cookie found');
      }
    } catch (e) {
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Error reading cookies (no user):', e);
    }
    
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminColorStyle", "Total (no user, no colors)", totalDuration);
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ❌ No user and no valid colors, returning null');
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
  
  console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - User settings loaded:', {
    hasSettings: !!settings,
    activeThemeId: settings?.active_theme_id || 'NO THEME ID'
  });

  // Helper function to get colors from cookies (defined early so it can be used in fallback logic)
  const getColorsFromCookies = async () => {
    try {
      // CRITICAL: Parse cookies manually from headers to avoid Next.js cookie parser issues
      const headersList = await headers();
      const cookieHeader = headersList.get('cookie') || '';
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Reading cookies from headers...');
      
      // Parse cookies manually
      const parseCookie = (name: string): string | null => {
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
        if (match && match[1]) {
          try {
            return decodeURIComponent(match[1]);
          } catch (e) {
            console.log(`[COLOR DEBUG] Failed to decode ${name}, using raw:`, match[1]);
            return match[1];
          }
        }
        return null;
      };
      
      // Get raw cookie values
      const cookieColor = parseCookie('primary-color-hsl');
      const cookieAccentColor = parseCookie('accent-color-hsl');
      
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Parsed cookie values from headers:', {
        primary: cookieColor || 'NOT FOUND',
        accent: cookieAccentColor || 'NOT FOUND'
      });
      
      // Cookies are already decoded by parseCookie helper
      if (cookieColor) {
        const hslMatch = cookieColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]);
          const s = parseInt(hslMatch[2]);
          const l = parseInt(hslMatch[3]);
          const primaryValue = cookieColor;
          
          let accentValue: string | null = null;
          let accentH: number | undefined = undefined;
          let accentS: number | undefined = undefined;
          let accentL: number | undefined = undefined;
          
          if (cookieAccentColor) {
            const accentHslMatch = cookieAccentColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
            if (accentHslMatch) {
              accentH = parseInt(accentHslMatch[1]);
              accentS = parseInt(accentHslMatch[2]);
              accentL = parseInt(accentHslMatch[3]);
              accentValue = cookieAccentColor;
            }
          }
          
          console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ✅ Successfully parsed cookie colors:', {
            h, s, l, primaryValue, accentValue
          });
          
          return { h, s, l, primaryValue, accentValue, accentH, accentS, accentL };
        } else {
          console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Cookie color found but failed to parse HSL format:', cookieColor);
        }
      }
    } catch (e) {
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Error reading cookies:', e);
    }
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - No valid colors found in cookies');
    return null;
  };

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

  // CRITICAL: Check cookies FIRST before Default Theme fallback
  // Cookies represent the user's actual selection and should always take precedence
  // This prevents default theme colors from overriding user's selected colors
  if (!color) {
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - No color from active theme, checking cookies first...');
    const cookieColors = await getColorsFromCookies();
    
    if (cookieColors) {
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Found colors in cookies, using them instead of Default Theme');
      // Use colors from cookies - these represent the user's actual selection
      const primaryValue = cookieColors.primaryValue;
      const renderStartTime = getTimestamp();
      const result = renderColorScript(
        primaryValue, 
        cookieColors.h, 
        cookieColors.s, 
        cookieColors.l, 
        cookieColors.accentValue, 
        cookieColors.accentH, 
        cookieColors.accentS, 
        cookieColors.accentL
      );
      const renderDuration = getDuration(renderStartTime);
      debugServerTiming("AdminColorStyle", "Color script render (from cookie, preferred over Default)", renderDuration, {
        hsl: primaryValue,
        accentHsl: cookieColors.accentValue
      });
      const totalDuration = getDuration(componentStartTime);
      debugServerTiming("AdminColorStyle", "Total (from cookie)", totalDuration);
      console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ✅ Returning color from cookie (preferred over Default Theme)');
      return result;
    }
  }

  // Fallback: No active theme and no cookies - check Default Theme
  if (!color) {
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - No cookies found, checking Default Theme as last resort...');
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
        console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Using Default Theme color as last resort');
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
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - Found color in database:', {
      primary: primaryValue,
      accent: accentValue,
      hsl_h: color.hsl_h,
      hsl_s: color.hsl_s,
      hsl_l: color.hsl_l
    });
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

  console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ⚠️ No color found in database after all attempts, checking cookies as ABSOLUTE LAST RESORT...');
  
  // CRITICAL: ALWAYS check cookies as absolute last resort
  // This ensures we NEVER return null if cookies have colors
  // This prevents default CSS flash by ensuring server ALWAYS injects colors
  const cookieColors = await getColorsFromCookies();
  
  if (cookieColors) {
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ✅ Found color in cookie (LAST RESORT):', cookieColors.primaryValue);
    const renderStartTime = getTimestamp();
    const result = renderColorScript(
      cookieColors.primaryValue, 
      cookieColors.h, 
      cookieColors.s, 
      cookieColors.l, 
      cookieColors.accentValue, 
      cookieColors.accentH, 
      cookieColors.accentS, 
      cookieColors.accentL
    );
    const renderDuration = getDuration(renderStartTime);
    debugServerTiming("AdminColorStyle", "Color script render (from cookie - LAST RESORT)", renderDuration, {
      hsl: cookieColors.primaryValue,
      accentHsl: cookieColors.accentValue
    });
    const totalDuration = getDuration(componentStartTime);
    debugServerTiming("AdminColorStyle", "Total (from cookie)", totalDuration);
    console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ✅ Successfully returning color from cookie (prevented default CSS flash)');
    return result;
  }
  
  console.log('[COLOR DEBUG] AdminColorStyle (SERVER) - ❌ No color found in database OR cookies, returning null (DEFAULT CSS WILL APPLY)');
  const totalDuration = getDuration(componentStartTime);
  debugServerTiming("AdminColorStyle", "Total (no color - WILL FLASH DEFAULT)", totalDuration);
  return null;
}

function renderColorScript(primaryValue: string, h: number, s: number, l: number, accentValue: string | null = null, accentH: number | undefined = undefined, accentS: number | undefined = undefined, accentL: number | undefined = undefined) {
  // Return style tag - Next.js will move it to head automatically
  // The middleware handles blocking script injection for preventing flash
  // This component serves as a fallback to ensure colors are applied
  // Apply ONLY to admin preset - NOT to :root to avoid affecting landing page
  // Note: Secondary color is not applied dynamically - it comes from CSS defaults in globals.css
  // CRITICAL: Use maximum specificity to override default CSS from globals.css
  // Include html element and all possible selectors to ensure highest priority
  const hslH = String(h);
  const hslS = String(s);
  const hslL = String(l);
  // Maximum specificity selector - includes html, body, and all nested elements
  const maxSpecificitySelector = `html.preset-admin,html.preset-admin.dark,html.preset-admin *,html.preset-admin.dark *,body.preset-admin,body.preset-admin.dark,body.preset-admin *,body.preset-admin.dark *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *`;
  let cssContent = `${maxSpecificitySelector}{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;

  // Add accent color if available
  if (accentValue && accentH !== undefined && accentS !== undefined && accentL !== undefined) {
    const accentHslH = String(accentH);
    const accentHslS = String(accentS);
    const accentHslL = String(accentL);
    cssContent += `${maxSpecificitySelector}{--accent-h:${accentHslH}!important;--accent-s:${accentHslS}!important;--accent-l:${accentHslL}!important;--accent:${accentValue}!important;}`;
  }
  
  return (
    <>
      <style
        id="primary-color-inline-server"
        dangerouslySetInnerHTML={{
          __html: `${maxSpecificitySelector}{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`,
        }}
      />
      {accentValue && accentH !== undefined && accentS !== undefined && accentL !== undefined && (
        <style
          id="accent-color-inline-server"
          dangerouslySetInnerHTML={{
            __html: `${maxSpecificitySelector}{--accent-h:${accentH}!important;--accent-s:${accentS}!important;--accent-l:${accentL}!important;--accent:${accentValue}!important;}`,
          }}
        />
      )}
    </>
  );
}
