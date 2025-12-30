import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Timeline } from "./types";
import { unstable_cache } from "next/cache";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";

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

/**
 * Get all timeline items for a specific section via section_timeline junction table
 */
export async function getTimelineBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const { data, error } = await supabase
    .from("section_timeline")
    .select(`
      *,
      timeline (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.timeline) return false;
      
      // Filter based on status from junction table
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.timeline,
      section_timeline: {
        id: item.id,
        position: item.position,
        status: item.status || "published",
        created_at: item.created_at,
      },
    }));
}
