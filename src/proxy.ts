import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

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

  // Re-set x-pathname header (may have been lost if Supabase auth refreshed the response)
  try {
    supabaseResponse.headers.set("x-pathname", pathname);
  } catch {
    // Non-blocking
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

  // For admin pages, inject font style tag into HTML response
  if (isAdminRoute) {
    // Skip for API routes and non-HTML responses
    if (pathname !== "/admin/login" && !pathname.startsWith("/api")) {
      try {
        let fontInjection = "";

        // Handle fonts - always use geist-sans for admin (static font)
        try {
          const fontCSS = `html.preset-admin,html.preset-admin *{--font-family-admin-heading:var(--font-geist-sans);--font-family-admin-body:var(--font-geist-sans);}html.preset-admin *,html.preset-admin *::before,html.preset-admin *::after{font-family:var(--font-geist-sans),system-ui,sans-serif!important;}html.preset-admin h1,html.preset-admin h2,html.preset-admin h3,html.preset-admin h4,html.preset-admin h5,html.preset-admin h6,html.preset-admin h1 *,html.preset-admin h2 *,html.preset-admin h3 *,html.preset-admin h4 *,html.preset-admin h5 *,html.preset-admin h6 *{font-family:var(--font-geist-sans),system-ui,sans-serif!important;}`;

          const fontBlockingScript = `<script>!function(){var d=document;var s=d.createElement('style');s.id='font-family-blocking';s.textContent=${JSON.stringify(fontCSS)};if(d.head){d.head.insertBefore(s,d.head.firstChild);}else{var a=0;function c(){a++;if(d.head){d.head.insertBefore(s,d.head.firstChild);}else if(a<100){c();}}c();}}();</script>`;
          const fontStyleTag = `<style id="font-family-inline">${fontCSS}</style>`;
          fontInjection = fontBlockingScript + fontStyleTag;
        } catch {
          // Silently ignore font injection errors
        }

        // Inject font styles into HTML response
        if (fontInjection) {
            const injection = fontInjection;

            try {
              // Check if response is HTML before attempting to inject
              const contentType = supabaseResponse.headers.get('content-type') || '';
              if (!contentType.includes('text/html')) {
                return supabaseResponse;
              }

              let buffer = "";
              let headInjected = false;

              const stream = new TransformStream({
                transform(chunk, controller) {
                  try {
                    const text = new TextDecoder().decode(chunk);
                    buffer += text;

                    if (!headInjected) {
                      const headMatch = buffer.match(/<head[^>]*>/i);
                      if (headMatch) {
                        const headIndex = buffer.indexOf(headMatch[0]);
                        const afterHead = headIndex + headMatch[0].length;
                        buffer = buffer.slice(0, afterHead) + injection + buffer.slice(afterHead);
                        headInjected = true;
                      }
                    }

                    if (headInjected || buffer.length > 8192) {
                      controller.enqueue(new TextEncoder().encode(buffer));
                      buffer = "";
                    }
                  } catch (transformError) {
                    controller.enqueue(chunk);
                  }
                },
                flush(controller) {
                  try {
                    if (buffer) {
                      if (!headInjected) {
                        if (/<head[^>]*>/i.test(buffer)) {
                          buffer = buffer.replace(/(<head[^>]*>)/i, `$1${injection}`);
                        }
                      }
                      controller.enqueue(new TextEncoder().encode(buffer));
                    }
                  } catch (flushError) {
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

              const safeHeaders = new Headers();
              try {
                supabaseResponse.headers.forEach((value, key) => {
                  try {
                    if (value && typeof value === 'string') {
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
                    if (process.env.NODE_ENV === 'development') {
                      console.warn(`Skipping problematic header ${key}:`, headerError);
                    }
                  }
                });
              } catch (headersError) {
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Failed to copy headers:', headersError);
                }
              }

              return new NextResponse(stream.readable, {
                headers: safeHeaders,
                status: supabaseResponse.status,
              });
            } catch (streamError) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to create injection stream, returning original response:', streamError);
              }
              return supabaseResponse;
            }
          }
      } catch (error) {
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

