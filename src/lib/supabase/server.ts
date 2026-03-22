import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    // If cookies() fails (e.g., due to malformed cookies), 
    // create a client without cookie support as a fallback.
    // This silently handles malformed cookies without logging
    // Create a minimal client without cookie support
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op when cookies can't be accessed
          },
        },
      }
    );
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll();
          } catch (error) {
            // If getAll() fails, return empty array
            console.warn("Failed to get cookies:", error);
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a service role client that bypasses RLS
 * Use this for public endpoints that need to insert data without authentication
 * WARNING: Only use this on the server side and never expose the service role key to the client
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Fetch all rows from a Supabase query, paginating in batches of 1000
 * to work around Supabase's max-rows server limit.
 */
export async function fetchAllRows<T>(
  queryBuilder: any,
  orderColumn = "created_at",
  ascending = true,
  pageSize = 1000
): Promise<{ data: T[]; error: any }> {
  const allRows: T[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await queryBuilder
      .order(orderColumn, { ascending })
      .range(offset, offset + pageSize - 1);

    if (error) return { data: allRows, error };
    if (!data || data.length === 0) break;

    allRows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return { data: allRows, error: null };
}

