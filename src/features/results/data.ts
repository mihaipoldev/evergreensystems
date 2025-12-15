import { createServiceRoleClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import type { Result } from "./types";

/**
 * Get all results, ordered by position
 * Uses service role client to bypass RLS for admin operations
 * Cached for 5 minutes to improve performance
 */
export async function getAllResults(): Promise<Result[]> {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
    ['all-results'],
    {
      revalidate: 60, // 1 minute
      tags: ['results'],
    }
  )();
}

/**
 * Get a single result by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getResultById(id: string): Promise<Result | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw error;
  }

  return data;
}
