import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Result } from "./types";
import { unstable_cache } from "next/cache";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";

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

/**
 * Get all results for a specific section via section_results junction table
 */
export async function getResultsBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const { data, error } = await supabase
    .from("section_results")
    .select(`
      *,
      results (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.results) return false;
      
      // Filter based on status from junction table
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.results,
      section_result: {
        id: item.id,
        position: item.position,
        status: item.status || "published",
        created_at: item.created_at,
      },
    }));
}
