import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { serializeFontFamily, getDefaultFontFamily } from "@/lib/font-utils";

export async function proxy(request: NextRequest) {
  try {
    // Safely get pathname - handle any encoding issues
    let pathname: string;
    try {
      pathname = request.nextUrl.pathname;
    } catch (pathError) {
      // If pathname parsing fails, use a safe default
      console.error('Failed to parse pathname:', pathError);
      return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    // Set pathname in headers for layout to use
    // Pathname is already valid, no encoding needed
    try {
      supabaseResponse.headers.set("x-pathname", pathname);
    } catch (headerError) {
      // If header setting fails, continue without it
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to set x-pathname header:', headerError);
      }
    }

    // Only create Supabase client and check auth for admin routes, intel routes, or login
    // Skip database queries entirely for public pages to avoid blocking
    const isAdminRoute = pathname.startsWith("/admin");
    const isIntelRoute = pathname.startsWith("/intel");
    const isLoginRoute = pathname === "/login";
    
    let user = null;
  
  if (isAdminRoute || isIntelRoute || isLoginRoute) {
    try {
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              try {
                return request.cookies.getAll();
              } catch (cookieError) {
                // If cookie parsing fails, return empty array
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Failed to get cookies:', cookieError);
                }
                return [];
              }
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  try {
                    // Validate cookie value before setting
                    if (value) {
                      decodeURIComponent(value); // Test if value is valid
                    }
                    request.cookies.set(name, value);
                  } catch {
                    // Skip problematic cookies
                    if (process.env.NODE_ENV === 'development') {
                      console.warn(`Skipping problematic cookie: ${name}`);
                    }
                  }
                });
                supabaseResponse = NextResponse.next({
                  request,
                });
                cookiesToSet.forEach(({ name, value, options }) => {
                  try {
                    if (value) {
                      decodeURIComponent(value); // Test if value is valid
                    }
                    supabaseResponse.cookies.set(name, value, options);
                  } catch {
                    // Skip problematic cookies
                  }
                });
              } catch (setCookieError) {
                // If cookie setting fails, continue without setting cookies
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Failed to set cookies:', setCookieError);
                }
              }
            },
          },
        }
      );

      // Refresh the auth token and session - with error handling
      try {
        // First refresh the session to ensure we have the latest auth state
        await supabase.auth.getSession();
        // Then get the user
        const result = await supabase.auth.getUser();
        user = result.data.user;
      } catch (error) {
        // If auth check fails, treat as unauthenticated
        // This prevents blocking the entire site
        user = null;
      }
    } catch (error) {
      // If Supabase client creation fails, continue without auth
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to create Supabase client:', error);
      }
      user = null;
    }
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    
    // Redirect /admin to /admin/analytics (exact match only)
    if (pathname === "/admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/analytics";
      // Preserve query parameters if any
      return NextResponse.redirect(url);
    }
  }

  // Protect intel routes
  if (isIntelRoute) {
    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // For admin pages, inject color style tag into HTML response
  if (isAdminRoute) {
    // Skip for API routes and non-HTML responses
    if (pathname !== "/admin/login" && !pathname.startsWith("/api")) {
      try {
        // Re-create supabase client for queries (it was scoped above)
        const supabase = createServerClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                  request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({
                  request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                  supabaseResponse.cookies.set(name, value, options)
                );
              },
            },
          }
        );

        // Get user settings with active theme - with error handling
        let settings = null;
        if (user) {
          try {
            const result = await (supabase
              .from("user_settings") as any)
              .select("active_theme_id")
              .eq("user_id", user.id)
              .maybeSingle();
            settings = result.data;
            console.log('[COLOR DEBUG] User settings loaded:', {
              hasSettings: !!settings,
              activeThemeId: settings?.active_theme_id || null
            });
          } catch (error) {
            // If query fails, continue without settings
            settings = null;
            console.error('[COLOR DEBUG] Error loading user settings:', error);
          }
        }

        let colorInjection = "";
        let fontInjection = "";
        // Store HSL values for inline HTML style injection
        let htmlInlineStyle = "";
        let colorHslValues: { h: string; s: string; l: string; primary: string } | null = null;

        if (user && settings?.active_theme_id) {
          console.log('[COLOR DEBUG] Active theme ID found:', settings.active_theme_id);
          // Get theme with primary color and fonts - with error handling
          let theme = null;
          try {
            const result = await (supabase
              .from("user_themes") as any)
              .select("primary_color_id, font_family")
              .eq("id", settings.active_theme_id)
              .single();
            theme = result.data;
            console.log('[COLOR DEBUG] Theme loaded:', {
              hasTheme: !!theme,
              primaryColorId: theme?.primary_color_id || null
            });
          } catch (error) {
            // If query fails, continue without theme
            theme = null;
            console.error('[COLOR DEBUG] Error loading theme:', error);
          }

          // Handle color
          let colorApplied = false;
          if (theme?.primary_color_id) {
            console.log('[COLOR DEBUG] Loading color from theme:', theme.primary_color_id);
            // Get color details - with error handling
            let color = null;
            try {
              const result = await (supabase
                .from("user_colors") as any)
                .select("hsl_h, hsl_s, hsl_l, hex")
                .eq("id", theme.primary_color_id)
                .single();
              color = result.data;
              console.log('[COLOR DEBUG] Color loaded from theme:', {
                hasColor: !!color,
                hex: color?.hex || null,
                hsl: color ? `${color.hsl_h} ${color.hsl_s}% ${color.hsl_l}%` : null
              });
            } catch (error) {
              // If query fails, continue without color
              color = null;
              console.error('[COLOR DEBUG] Error loading color from theme:', error);
            }

            if (color) {
              colorApplied = true;
              console.log('[COLOR DEBUG] ✅ Applying color from active theme');
              const primaryValue = `${color.hsl_h} ${color.hsl_s}% ${color.hsl_l}%`;
              
              // Set cookie for instant access on next page load
              try {
                const expires = new Date();
                expires.setFullYear(expires.getFullYear() + 1);
                supabaseResponse.cookies.set('primary-color-hsl', primaryValue, {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                // Also set brand color variables in cookie
                supabaseResponse.cookies.set('brand-color-h', color.hsl_h.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                supabaseResponse.cookies.set('brand-color-s', color.hsl_s.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                supabaseResponse.cookies.set('brand-color-l', color.hsl_l.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
              } catch {
                // Silently ignore cookie setting errors - non-critical
              }
              
              // Inject style tag AND blocking script as the ABSOLUTE FIRST thing in head
              // Set brand color variables and primary (which uses brand variables)
              // Use JSON.stringify to safely escape all values for JavaScript
              const hslH = String(color.hsl_h);
              const hslS = String(color.hsl_s);
              const hslL = String(color.hsl_l);
              
              // Store values for inline HTML injection
              colorHslValues = { h: hslH, s: hslS, l: hslL, primary: primaryValue };
              htmlInlineStyle = ` style="--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;"`;
              
              // Build CSS string safely
              const cssContent = `:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;
              // Use immediate execution - set colors before any CSS loads
              const blockingScript = `<script>(function(){var d=document,r=d.documentElement;if(r){r.style.setProperty('--brand-h',${JSON.stringify(hslH)},'important');r.style.setProperty('--brand-s',${JSON.stringify(hslS)},'important');r.style.setProperty('--brand-l',${JSON.stringify(hslL)},'important');r.style.setProperty('--primary',${JSON.stringify(primaryValue)},'important');}var s=d.createElement('style');s.id='primary-color-blocking';s.textContent=${JSON.stringify(cssContent)};if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(d.documentElement){d.documentElement.insertBefore(s,d.documentElement.firstChild);}else{var a=0;function c(){a++;if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(a<100){setTimeout(c,1);}else{d.documentElement.appendChild(s);}}c();}try{var e=new Date();e.setFullYear(e.getFullYear()+1);document.cookie='primary-color-hsl='+${JSON.stringify(primaryValue)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-h='+${JSON.stringify(hslH)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-s='+${JSON.stringify(hslS)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-l='+${JSON.stringify(hslL)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';}catch(x){}})();</script>`;
              const styleTag = `<style id="primary-color-inline">:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}</style>`;
              colorInjection = blockingScript + styleTag;
              colorApplied = true;
            }
          }
          
          // If active theme doesn't exist or color not found, fallback to Default Theme
          if (!colorApplied) {

          // Handle fonts - always use geist-sans for admin (static font)
          // No need to check theme?.font_family since we always use the same font
          try {
            // Always use geist-sans for admin (no dynamic font switching)
            const fontCSS = `html.preset-admin,html.preset-admin *{--font-family-admin-heading:var(--font-geist-sans);--font-family-admin-body:var(--font-geist-sans);}html.preset-admin *,html.preset-admin *::before,html.preset-admin *::after{font-family:var(--font-geist-sans),system-ui,sans-serif!important;}html.preset-admin h1,html.preset-admin h2,html.preset-admin h3,html.preset-admin h4,html.preset-admin h5,html.preset-admin h6,html.preset-admin h1 *,html.preset-admin h2 *,html.preset-admin h3 *,html.preset-admin h4 *,html.preset-admin h5 *,html.preset-admin h6 *{font-family:var(--font-geist-sans),system-ui,sans-serif!important;}`;
            
            // Inject blocking script for fonts (early font application)
            // Do NOT set root-level CSS variables - only apply to .preset-admin
            const fontBlockingScript = `<script>!function(){var d=document;var s=d.createElement('style');s.id='font-family-blocking';s.textContent=${JSON.stringify(fontCSS)};if(d.head){d.head.insertBefore(s,d.head.firstChild);}else{var a=0;function c(){a++;if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(a<100){c();}}c();}}();</script>`;
            const fontStyleTag = `<style id="font-family-inline">${fontCSS}</style>`;
            fontInjection = fontBlockingScript + fontStyleTag;
          } catch {
            // Silently ignore font injection errors
          }
          
          // If active theme doesn't exist or color not found, fallback to Default Theme
          if (!colorApplied) {
            console.log('[COLOR DEBUG] ⚠️ Active theme color not applied, checking fallbacks...');
            // Check if "Default Theme" exists
            let defaultTheme = null;
            let userColor = null;
            
            try {
              // Check if "Default Theme" exists
              const themeResult = await (supabase
                .from("user_themes") as any)
                .select("id, primary_color_id")
                .eq("user_id", user.id)
                .eq("name", "Default Theme")
                .maybeSingle();
              defaultTheme = themeResult.data;
              console.log('[COLOR DEBUG] Default Theme check:', {
                hasDefaultTheme: !!defaultTheme,
                defaultThemeId: defaultTheme?.id || null,
                primaryColorId: defaultTheme?.primary_color_id || null
              });
            } catch (error) {
              // If query fails, continue without theme
              defaultTheme = null;
              console.error('[COLOR DEBUG] Error checking Default Theme:', error);
            }

            // If Default Theme exists, use its primary color
            if (defaultTheme?.primary_color_id) {
              console.log('[COLOR DEBUG] Loading color from Default Theme:', defaultTheme.primary_color_id);
              try {
                const colorResult = await (supabase
                  .from("user_colors") as any)
                  .select("id, hsl_h, hsl_s, hsl_l, hex")
                  .eq("id", defaultTheme.primary_color_id)
                  .single();
                userColor = colorResult.data;
                console.log('[COLOR DEBUG] Color loaded from Default Theme:', {
                  hasColor: !!userColor,
                  hex: userColor?.hex || null,
                  hsl: userColor ? `${userColor.hsl_h} ${userColor.hsl_s}% ${userColor.hsl_l}%` : null
                });
                
                // CRITICAL: Do NOT set Default Theme as active in database
                // This is only a fallback for color injection - user's selected theme should remain active
                // Only the Settings UI should change active_theme_id when user explicitly selects a theme
                console.log('[COLOR DEBUG] Using Default Theme color as fallback (NOT changing active_theme_id in database)');
              } catch (error) {
                // If color query fails, continue without color
                userColor = null;
                console.error('[COLOR DEBUG] Error loading color from Default Theme:', error);
              }
            }
            
            // If no Default Theme or its color not found, check cookies for last applied color
            if (!userColor) {
              console.log('[COLOR DEBUG] No Default Theme color, checking cookies...');
              try {
                // Check if we have a color saved in cookies (from previous page load)
                const cookieColorHsl = request.cookies.get('primary-color-hsl')?.value;
                console.log('[COLOR DEBUG] Cookie value:', cookieColorHsl || 'not found');
                if (cookieColorHsl) {
                  // Parse HSL from cookie (format: "H S% L%")
                  const hslMatch = cookieColorHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
                  if (hslMatch) {
                    const [, h, s, l] = hslMatch;
                    console.log('[COLOR DEBUG] Parsed HSL from cookie:', { h, s, l });
                    // Find the color in database that matches this HSL
                    const result = await (supabase
                      .from("user_colors") as any)
                      .select("id, hsl_h, hsl_s, hsl_l, hex")
                      .eq("user_id", user.id)
                      .eq("hsl_h", parseInt(h))
                      .eq("hsl_s", parseInt(s))
                      .eq("hsl_l", parseInt(l))
                      .maybeSingle();
                    userColor = result.data;
                    console.log('[COLOR DEBUG] Color from cookie:', {
                      hasColor: !!userColor,
                      hex: userColor?.hex || null
                    });
                  }
                }
              } catch (error) {
                // If cookie check fails, continue without color
                userColor = null;
                console.error('[COLOR DEBUG] Error checking cookies:', error);
              }
            }
            
            // Only as absolute last resort, don't fallback to first color
            // Let the user select a color manually instead
            if (!userColor) {
              console.log('[COLOR DEBUG] ❌ No color found - user must select manually');
            }

            if (userColor) {
              console.log('[COLOR DEBUG] ✅ Applying fallback color:', {
                hex: userColor.hex,
                hsl: `${userColor.hsl_h} ${userColor.hsl_s}% ${userColor.hsl_l}%`,
                source: defaultTheme ? 'Default Theme' : 'Cookie'
              });
              const primaryValue = `${userColor.hsl_h} ${userColor.hsl_s}% ${userColor.hsl_l}%`;
              
              // Set cookie for instant access on next page load
              try {
                const expires = new Date();
                expires.setFullYear(expires.getFullYear() + 1);
                supabaseResponse.cookies.set('primary-color-hsl', primaryValue, {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                // Also set brand color variables in cookie
                supabaseResponse.cookies.set('brand-color-h', userColor.hsl_h.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                supabaseResponse.cookies.set('brand-color-s', userColor.hsl_s.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                supabaseResponse.cookies.set('brand-color-l', userColor.hsl_l.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                console.log('[COLOR DEBUG] Cookie set for next page load');
              } catch {
                // Silently ignore cookie setting errors - non-critical
                console.error('[COLOR DEBUG] Failed to set cookie');
              }
              
              // Inject style tag AND blocking script as the ABSOLUTE FIRST thing in head
              const hslH = String(userColor.hsl_h);
              const hslS = String(userColor.hsl_s);
              const hslL = String(userColor.hsl_l);
              
              // Store values for inline HTML injection
              colorHslValues = { h: hslH, s: hslS, l: hslL, primary: primaryValue };
              htmlInlineStyle = ` style="--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;"`;
              
              // Build CSS string safely
              const cssContent = `:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;
              // Use immediate execution - set colors before any CSS loads
              const blockingScript = `<script>(function(){var d=document,r=d.documentElement;if(r){r.style.setProperty('--brand-h',${JSON.stringify(hslH)},'important');r.style.setProperty('--brand-s',${JSON.stringify(hslS)},'important');r.style.setProperty('--brand-l',${JSON.stringify(hslL)},'important');r.style.setProperty('--primary',${JSON.stringify(primaryValue)},'important');}var s=d.createElement('style');s.id='primary-color-blocking';s.textContent=${JSON.stringify(cssContent)};if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(d.documentElement){d.documentElement.insertBefore(s,d.documentElement.firstChild);}else{var a=0;function c(){a++;if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(a<100){setTimeout(c,1);}else{d.documentElement.appendChild(s);}}c();}try{var e=new Date();e.setFullYear(e.getFullYear()+1);document.cookie='primary-color-hsl='+${JSON.stringify(primaryValue)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-h='+${JSON.stringify(hslH)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-s='+${JSON.stringify(hslS)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-l='+${JSON.stringify(hslL)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';}catch(x){}})();</script>`;
              const styleTag = `<style id="primary-color-inline">:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}</style>`;
              colorInjection = blockingScript + styleTag;
            }
          }
        } else if (user) {
          console.log('[COLOR DEBUG] ⚠️ No active theme ID in settings');
          // No active theme - first check if "Default Theme" exists (even if not set as active)
          let defaultTheme = null;
          let userColor = null;
          
          try {
            // Check if "Default Theme" exists
            const themeResult = await (supabase
              .from("user_themes") as any)
              .select("id, primary_color_id")
              .eq("user_id", user.id)
              .eq("name", "Default Theme")
              .maybeSingle();
            defaultTheme = themeResult.data;
            console.log('[COLOR DEBUG] Default Theme check (no active theme):', {
              hasDefaultTheme: !!defaultTheme,
              defaultThemeId: defaultTheme?.id || null,
              primaryColorId: defaultTheme?.primary_color_id || null
            });
          } catch (error) {
            // If query fails, continue without theme
            defaultTheme = null;
            console.error('[COLOR DEBUG] Error checking Default Theme:', error);
          }

          // If Default Theme exists, use its primary color
          if (defaultTheme?.primary_color_id) {
            console.log('[COLOR DEBUG] Loading color from Default Theme:', defaultTheme.primary_color_id);
            try {
              const colorResult = await (supabase
                .from("user_colors") as any)
                .select("id, hsl_h, hsl_s, hsl_l, hex")
                .eq("id", defaultTheme.primary_color_id)
                .single();
              userColor = colorResult.data;
              console.log('[COLOR DEBUG] Color loaded from Default Theme:', {
                hasColor: !!userColor,
                hex: userColor?.hex || null,
                hsl: userColor ? `${userColor.hsl_h} ${userColor.hsl_s}% ${userColor.hsl_l}%` : null
              });
              
              // CRITICAL: Do NOT set Default Theme as active in database
              // This is only a fallback for color injection - user's selected theme should remain active
              // Only the Settings UI should change active_theme_id when user explicitly selects a theme
              console.log('[COLOR DEBUG] Using Default Theme color as fallback (NOT changing active_theme_id in database)');
            } catch (error) {
              // If color query fails, continue without color
              userColor = null;
              console.error('[COLOR DEBUG] Error loading color from Default Theme:', error);
            }
          }
          
          // If no Default Theme or its color not found, check cookies for last applied color
          if (!userColor) {
            console.log('[COLOR DEBUG] No Default Theme color, checking cookies...');
            try {
              // Check if we have a color saved in cookies (from previous page load)
              const cookieColorHsl = request.cookies.get('primary-color-hsl')?.value;
              console.log('[COLOR DEBUG] Cookie value:', cookieColorHsl || 'not found');
              if (cookieColorHsl) {
                // Parse HSL from cookie (format: "H S% L%")
                const hslMatch = cookieColorHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
                if (hslMatch) {
                  const [, h, s, l] = hslMatch;
                  console.log('[COLOR DEBUG] Parsed HSL from cookie:', { h, s, l });
                  // Find the color in database that matches this HSL
                  const result = await (supabase
                    .from("user_colors") as any)
                    .select("id, hsl_h, hsl_s, hsl_l, hex")
                    .eq("user_id", user.id)
                    .eq("hsl_h", parseInt(h))
                    .eq("hsl_s", parseInt(s))
                    .eq("hsl_l", parseInt(l))
                    .maybeSingle();
                  userColor = result.data;
                  console.log('[COLOR DEBUG] Color from cookie:', {
                    hasColor: !!userColor,
                    hex: userColor?.hex || null
                  });
                }
              }
            } catch (error) {
              // If cookie check fails, continue without color
              userColor = null;
              console.error('[COLOR DEBUG] Error checking cookies:', error);
            }
          }
          
          // Only as absolute last resort, don't fallback to first color
          // Let the user select a color manually instead
          if (!userColor) {
            console.log('[COLOR DEBUG] ❌ No color found - user must select manually');
          }

          if (userColor) {
            // Only create/update default theme if we didn't already find one
            if (!defaultTheme) {
              try {
                const defaultFontJson = serializeFontFamily(getDefaultFontFamily());
                
                // Check if default theme already exists
                const { data: existingTheme } = await (supabase
                  .from("user_themes") as any)
                  .select("id")
                  .eq("user_id", user.id)
                  .eq("name", "Default Theme")
                  .maybeSingle();

                let themeId: string;
                if (existingTheme) {
                  // Update existing theme
                  const { error: updateError } = await (supabase
                    .from("user_themes") as any)
                    .update({
                      primary_color_id: userColor.id,
                      secondary_color_id: userColor.id,
                      accent_color_id: userColor.id,
                    })
                    .eq("id", existingTheme.id);
                  if (updateError) throw updateError;
                  themeId = existingTheme.id;
                } else {
                  // Create new default theme
                  const { data: newTheme, error: themeError } = await (supabase
                    .from("user_themes") as any)
                    .insert({
                      user_id: user.id,
                      name: "Default Theme",
                      primary_color_id: userColor.id,
                      secondary_color_id: userColor.id,
                      accent_color_id: userColor.id,
                      font_family: defaultFontJson,
                    })
                    .select("id")
                    .single();
                  if (themeError) throw themeError;
                  themeId = newTheme.id;
                }

                // Update user_settings to set active theme
                await (supabase
                  .from("user_settings") as any)
                  .upsert(
                    {
                      user_id: user.id,
                      active_theme_id: themeId,
                    },
                    {
                      onConflict: "user_id",
                    }
                  );
              } catch {
                // Silently ignore theme creation errors
              }
            }

              // Apply the color
              const primaryValue = `${userColor.hsl_h} ${userColor.hsl_s}% ${userColor.hsl_l}%`;
              
              // Set cookie for instant access on next page load
              try {
                const expires = new Date();
                expires.setFullYear(expires.getFullYear() + 1);
                supabaseResponse.cookies.set('primary-color-hsl', primaryValue, {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                // Also set brand color variables in cookie
                supabaseResponse.cookies.set('brand-color-h', userColor.hsl_h.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                supabaseResponse.cookies.set('brand-color-s', userColor.hsl_s.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
                supabaseResponse.cookies.set('brand-color-l', userColor.hsl_l.toString(), {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
              } catch {
                // Silently ignore cookie setting errors - non-critical
              }
              
              // Inject style tag AND blocking script as the ABSOLUTE FIRST thing in head
              const hslH = String(userColor.hsl_h);
              const hslS = String(userColor.hsl_s);
              const hslL = String(userColor.hsl_l);
              
              // Store values for inline HTML injection
              colorHslValues = { h: hslH, s: hslS, l: hslL, primary: primaryValue };
              htmlInlineStyle = ` style="--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;"`;
              
              // Build CSS string safely
              const cssContent = `:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;
              // Use immediate execution - set colors before any CSS loads
              const blockingScript = `<script>(function(){var d=document,r=d.documentElement;if(r){r.style.setProperty('--brand-h',${JSON.stringify(hslH)},'important');r.style.setProperty('--brand-s',${JSON.stringify(hslS)},'important');r.style.setProperty('--brand-l',${JSON.stringify(hslL)},'important');r.style.setProperty('--primary',${JSON.stringify(primaryValue)},'important');}var s=d.createElement('style');s.id='primary-color-blocking';s.textContent=${JSON.stringify(cssContent)};if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(d.documentElement){d.documentElement.insertBefore(s,d.documentElement.firstChild);}else{var a=0;function c(){a++;if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(a<100){setTimeout(c,1);}else{d.documentElement.appendChild(s);}}c();}try{var e=new Date();e.setFullYear(e.getFullYear()+1);document.cookie='primary-color-hsl='+${JSON.stringify(primaryValue)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-h='+${JSON.stringify(hslH)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-s='+${JSON.stringify(hslS)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-l='+${JSON.stringify(hslL)}+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';}catch(x){}})();</script>`;
              const styleTag = `<style id="primary-color-inline">:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}</style>`;
              colorInjection = blockingScript + styleTag;
            }
          }
        }

        // Combine injections if we have any
        if (colorInjection || fontInjection) {
            const injection = colorInjection + fontInjection;

            try {
              // Check if response is HTML before attempting to inject
              const contentType = supabaseResponse.headers.get('content-type') || '';
              if (!contentType.includes('text/html')) {
                // Not HTML, return original response
                return supabaseResponse;
              }

              let buffer = "";
              let headInjected = false;
              let htmlStyled = false;

              const stream = new TransformStream({
                transform(chunk, controller) {
                  try {
                    const text = new TextDecoder().decode(chunk);
                    buffer += text;
                    
                    // CRITICAL: First inject inline styles directly into <html> tag
                    // This applies colors before ANY CSS loads - no flash possible
                    if (!htmlStyled && htmlInlineStyle) {
                      const htmlMatch = buffer.match(/<html([^>]*)>/i);
                      if (htmlMatch) {
                        const htmlIndex = buffer.indexOf(htmlMatch[0]);
                        const htmlTagEnd = htmlIndex + htmlMatch[0].length - 1; // Before closing >
                        // Only inject if style attribute doesn't already exist
                        if (!htmlMatch[1].includes('style=')) {
                          buffer = buffer.slice(0, htmlTagEnd) + htmlInlineStyle + buffer.slice(htmlTagEnd);
                          htmlStyled = true;
                        } else {
                          htmlStyled = true; // Already has style, skip
                        }
                      }
                    }
                    
                    if (!headInjected) {
                      // Then inject as the ABSOLUTE FIRST thing after <head>
                      const headMatch = buffer.match(/<head[^>]*>/i);
                      if (headMatch) {
                        const headIndex = buffer.indexOf(headMatch[0]);
                        const afterHead = headIndex + headMatch[0].length;
                        // Inject blocking script + style tag immediately after <head>
                        buffer = buffer.slice(0, afterHead) + injection + buffer.slice(afterHead);
                        headInjected = true;
                      }
                      // Fallback: inject before ANY other tag
                      else {
                        const anyTagMatch = buffer.match(/<[^/!][^>]*>/i);
                        if (anyTagMatch && !anyTagMatch[0].match(/^<html|^<head|^<body/i)) {
                          const matchIndex = buffer.indexOf(anyTagMatch[0]);
                          buffer = buffer.slice(0, matchIndex) + injection + buffer.slice(matchIndex);
                          headInjected = true;
                        }
                      }
                    }
                    
                    // Flush buffer if we've injected or buffer is getting large
                    if (headInjected || buffer.length > 8192) {
                      controller.enqueue(new TextEncoder().encode(buffer));
                      buffer = "";
                    }
                  } catch (transformError) {
                    // If transform fails, just pass through the chunk without modification
                    controller.enqueue(chunk);
                  }
                },
                flush(controller) {
                  try {
                    if (buffer) {
                      // Last chance: inject HTML inline style if we haven't yet
                      if (!htmlStyled && htmlInlineStyle) {
                        const htmlMatch = buffer.match(/<html([^>]*)>/i);
                        if (htmlMatch && !htmlMatch[1].includes('style=')) {
                          buffer = buffer.replace(/(<html[^>]*)>/i, `$1${htmlInlineStyle}>`);
                          htmlStyled = true;
                        }
                      }
                      // Last chance: inject head injection if we haven't yet
                      if (!headInjected) {
                        if (/<head[^>]*>/i.test(buffer)) {
                          buffer = buffer.replace(/(<head[^>]*>)/i, `$1${injection}`);
                        } else if (/<html[^>]*>/i.test(buffer)) {
                          // If head doesn't exist, try to inject after html tag
                          buffer = buffer.replace(/(<html[^>]*>)/i, `$1${injection}`);
                        }
                      }
                      controller.enqueue(new TextEncoder().encode(buffer));
                    }
                  } catch (flushError) {
                    // If flush fails, try to encode buffer as-is
                    try {
                      if (buffer) {
                        controller.enqueue(new TextEncoder().encode(buffer));
                      }
                    } catch {
                      // Silently ignore if encoding fails
                    }
                  }
                },
              });

              // Safely copy headers to avoid any encoding issues
              const safeHeaders = new Headers();
              try {
                supabaseResponse.headers.forEach((value, key) => {
                  try {
                    // Validate header value before setting
                    if (value && typeof value === 'string') {
                      // Skip Set-Cookie headers that might have encoding issues
                      if (key.toLowerCase() === 'set-cookie') {
                        try {
                          safeHeaders.append(key, value);
                        } catch {
                          // Skip problematic cookies
                        }
                      } else {
                        safeHeaders.set(key, value);
                      }
                    }
                  } catch (headerError) {
                    // Skip problematic headers
                    if (process.env.NODE_ENV === 'development') {
                      console.warn(`Skipping problematic header ${key}:`, headerError);
                    }
                  }
                });
              } catch (headersError) {
                // If header copying fails, use empty headers
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Failed to copy headers:', headersError);
                }
              }

              return new NextResponse(stream.readable, {
                headers: safeHeaders,
                status: supabaseResponse.status,
              });
            } catch (streamError) {
              // If stream creation fails, return original response without injection
              // This prevents blocking the page
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to create injection stream, returning original response:', streamError);
              }
              return supabaseResponse;
            }
          }
      } catch (error) {
        // Silently ignore proxy injection errors - don't block the page
        // Log in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn('Proxy injection error (non-blocking):', error);
        }
      }
    }
  }

  // Redirect authenticated users away from login page
  if (isLoginRoute) {
      if (user) {
        // Redirect to admin analytics dashboard if already authenticated
        const url = request.nextUrl.clone();
        url.pathname = "/admin/analytics";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (error) {
    // If anything fails in proxy, return a basic response to prevent blocking
    // This ensures the site remains accessible even if proxy crashes
    console.error('Proxy error:', error);
    return NextResponse.next({
      request,
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

