import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { SocialPlatform } from "./types";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";

/**
 * Get all social platforms, ordered by name
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllSocialPlatforms(): Promise<SocialPlatform[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("social_platforms")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single social platform by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getSocialPlatformById(id: string): Promise<SocialPlatform | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("social_platforms")
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
 * Get all social platforms for a specific section via section_socials junction table
 */
export async function getSocialPlatformsBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const { data, error } = await supabase
    .from("section_socials")
    .select(`
      *,
      social_platforms (*)
    `)
    .eq("section_id", sectionId)
    .order("order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.social_platforms) return false;
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.social_platforms,
      section_social: {
        id: item.id,
        order: item.order,
        status: (item.status || "published") as "published" | "draft" | "deactivated",
        created_at: item.created_at,
      },
    }));
}
