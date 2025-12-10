import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { parseFontFamily, serializeFontFamily } from "@/lib/font-utils";
import { getFontVariable } from "@/lib/font-variables";

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    let supabaseResponse = NextResponse.next({
      request,
    });

    // Set pathname in headers for layout to use
    // Pathname is already valid, no encoding needed
    supabaseResponse.headers.set("x-pathname", pathname);

    // Only create Supabase client and check auth for admin routes or login
    // Skip database queries entirely for public pages to avoid blocking
    const isAdminRoute = pathname.startsWith("/admin");
    const isLoginRoute = pathname === "/login";
    
    let user = null;
  
  if (isAdminRoute || isLoginRoute) {
    try {
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

      // Refresh the auth token - with error handling
      try {
        const result = await supabase.auth.getUser();
        user = result.data.user;
      } catch (error) {
        // If auth check fails, treat as unauthenticated
        // This prevents blocking the entire site
        user = null;
      }
    } catch (error) {
      // If Supabase client creation fails, continue without auth
      console.warn('Failed to create Supabase client:', error);
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

    // For admin pages, inject color style tag into HTML response
    if (pathname !== "/admin/login") {
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
        try {
          const result = await (supabase
            .from("user_settings") as any)
            .select("active_theme_id")
            .eq("user_id", user.id)
            .maybeSingle();
          settings = result.data;
        } catch (error) {
          // If query fails, continue without settings
          settings = null;
        }

        if (settings?.active_theme_id) {
          // Get theme with primary color and fonts - with error handling
          let theme = null;
          try {
            const result = await (supabase
              .from("user_themes") as any)
              .select("primary_color_id, font_family")
              .eq("id", settings.active_theme_id)
              .single();
            theme = result.data;
          } catch (error) {
            // If query fails, continue without theme
            theme = null;
          }

          let colorInjection = "";
          let fontInjection = "";

          // Handle color
          if (theme?.primary_color_id) {
            // Get color details - with error handling
            let color = null;
            try {
              const result = await (supabase
                .from("user_colors") as any)
                .select("hsl_h, hsl_s, hsl_l, hex")
                .eq("id", theme.primary_color_id)
                .single();
              color = result.data;
            } catch (error) {
              // If query fails, continue without color
              color = null;
            }

            if (color) {
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
              
              // Build CSS string safely
              const cssContent = `:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}`;
              const blockingScript = `<script>!function(){var d=document,r=d.documentElement;if(r){r.style.setProperty('--brand-h',${JSON.stringify(hslH)},'important');r.style.setProperty('--brand-s',${JSON.stringify(hslS)},'important');r.style.setProperty('--brand-l',${JSON.stringify(hslL)},'important');r.style.setProperty('--primary',${JSON.stringify(primaryValue)},'important');}var s=d.createElement('style');s.id='primary-color-blocking';s.textContent=${JSON.stringify(cssContent)};if(d.head){d.head.insertBefore(s,d.head.firstChild);}else{var a=0;function c(){a++;if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(a<100){c();}}c();}try{var e=new Date();e.setFullYear(e.getFullYear()+1);document.cookie='primary-color-hsl='+encodeURIComponent(${JSON.stringify(primaryValue)})+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-h='+encodeURIComponent(${JSON.stringify(hslH)})+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-s='+encodeURIComponent(${JSON.stringify(hslS)})+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';document.cookie='brand-color-l='+encodeURIComponent(${JSON.stringify(hslL)})+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';}catch(x){}}();</script>`;
              const styleTag = `<style id="primary-color-inline">:root,:root *,html,html *,body,body *,.preset-admin,.preset-admin *,.preset-admin.dark,.preset-admin.dark *{--brand-h:${hslH}!important;--brand-s:${hslS}!important;--brand-l:${hslL}!important;--primary:${primaryValue}!important;}</style>`;
              colorInjection = blockingScript + styleTag;
            }
          }

          // Handle fonts
          if (theme?.font_family) {
            try {
              const fonts = parseFontFamily(theme.font_family);
              const fontJson = serializeFontFamily(fonts);
              
              // Set cookie for instant access on next page load
              try {
                const expires = new Date();
                expires.setFullYear(expires.getFullYear() + 1);
                supabaseResponse.cookies.set('font-family-json', fontJson, {
                  expires: expires,
                  path: '/',
                  sameSite: 'lax',
                });
              } catch {
                // Silently ignore cookie setting errors - non-critical
              }
              
              // Generate CSS variables (admin only)
              const adminHeadingVar = getFontVariable(fonts.admin.heading);
              const adminBodyVar = getFontVariable(fonts.admin.body);
              
              const fontCSS = `:root{--font-family-admin-heading:var(${adminHeadingVar});--font-family-admin-body:var(${adminBodyVar});}html.preset-admin body,html.preset-admin body *,.preset-admin body,.preset-admin body *{font-family:var(${adminBodyVar}),system-ui,sans-serif!important;}html.preset-admin body h1,html.preset-admin body h2,html.preset-admin body h3,html.preset-admin body h4,html.preset-admin body h5,html.preset-admin body h6,.preset-admin h1,.preset-admin h2,.preset-admin h3,.preset-admin h4,.preset-admin h5,.preset-admin h6{font-family:var(${adminHeadingVar}),system-ui,sans-serif!important;}`;
              
              // Inject blocking script for fonts
              // Use JSON.stringify to safely escape fontJson for JavaScript
              const fontBlockingScript = `<script>!function(){var d=document,r=d.documentElement;if(r){r.style.setProperty('--font-family-admin-heading','var(${adminHeadingVar})','important');r.style.setProperty('--font-family-admin-body','var(${adminBodyVar})','important');}var s=d.createElement('style');s.id='font-family-blocking';s.textContent=${JSON.stringify(fontCSS)};if(d.head){d.head.insertBefore(s,d.head.firstChild);}else{var a=0;function c(){a++;if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(a<100){c();}}c();}try{var e=new Date();e.setFullYear(e.getFullYear()+1);document.cookie='font-family-json='+encodeURIComponent(${JSON.stringify(fontJson)})+'; expires='+e.toUTCString()+'; path=/; SameSite=Lax';}catch(x){}}();</script>`;
              const fontStyleTag = `<style id="font-family-inline">${fontCSS}</style>`;
              fontInjection = fontBlockingScript + fontStyleTag;
            } catch {
              // Silently ignore font parsing errors
            }
          }

          // Combine injections if we have any
          if (colorInjection || fontInjection) {
            const injection = colorInjection + fontInjection;

              let buffer = "";
              let headInjected = false;

              const stream = new TransformStream({
                transform(chunk, controller) {
                  const text = new TextDecoder().decode(chunk);
                  buffer += text;
                  
                  if (!headInjected) {
                    // CRITICAL: Inject as the ABSOLUTE FIRST thing after <head>
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
                },
                flush(controller) {
                  if (buffer) {
                    // Last chance: inject if we haven't yet
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
                },
              });

              return new NextResponse(stream.readable, {
                headers: supabaseResponse.headers,
                status: supabaseResponse.status,
              });
          }
        }
      } catch (error) {
        // Silently ignore middleware injection errors - don't block the page
        // Log in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn('Middleware injection error (non-blocking):', error);
        }
      }
    }
  }

    // Redirect authenticated users away from login page
    if (isLoginRoute) {
      if (user) {
        // Redirect to admin dashboard if already authenticated
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (error) {
    // If anything fails in middleware, return a basic response to prevent blocking
    // This ensures the site remains accessible even if middleware crashes
    console.error('Middleware error:', error);
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

