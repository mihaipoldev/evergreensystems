import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return document.cookie.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            return { name, value: rest.join('=') || '' };
          }).filter(cookie => cookie.name);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}; path=/`;
            
            if (options?.maxAge) {
              cookieString += `; max-age=${options.maxAge}`;
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`;
            }
            if (options?.sameSite) {
              cookieString += `; samesite=${options.sameSite}`;
            }
            if (options?.secure) {
              cookieString += `; secure`;
            }
            
            document.cookie = cookieString;
          });
        },
      },
    }
  );
}

