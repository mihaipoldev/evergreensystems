import { createServiceRoleClient } from "@/lib/supabase/server";
import type { SocialPlatform } from "./types";

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
