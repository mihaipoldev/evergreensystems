import { createServiceRoleClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import type { Timeline } from "./types";

/**
 * Get all timeline items, ordered by position
 * Uses service role client to bypass RLS for admin operations
 * Cached for 5 minutes to improve performance
 */
export async function getAllTimelineItems(): Promise<Timeline[]> {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase
        .from("timeline")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
    ['all-timeline-items'],
    {
      revalidate: 60, // 1 minute
      tags: ['timeline'],
    }
  )();
}

/**
 * Get a single timeline item by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getTimelineItemById(id: string): Promise<Timeline | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("timeline")
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
