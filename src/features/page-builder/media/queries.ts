import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Media, MediaInsert, MediaUpdate } from "./types";
import type { Database } from "@/lib/supabase/types";

/**
 * Get all media items, ordered by created_at descending
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllMedia(): Promise<Media[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("media")
    .select("id, type, source_type, url, embed_id, name, thumbnail_url, duration, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single media item by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getMediaById(id: string): Promise<Media | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("media")
    .select("id, type, source_type, url, embed_id, name, thumbnail_url, duration, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw error;
  }

  return data || null;
}

/**
 * Create a new media record
 * Uses service role client to bypass RLS for admin operations
 */
export async function createMedia(data: MediaInsert): Promise<Media> {
  const supabase = createServiceRoleClient();
  const { data: media, error } = await ((supabase
    .from("media") as any)
    .insert(data)
    .select()
    .single() as Promise<{ data: any; error: any }>);

  if (error) {
    throw error;
  }

  if (!media) {
    throw new Error("Failed to create media");
  }

  return media;
}

/**
 * Update a media record
 * Uses service role client to bypass RLS for admin operations
 */
export async function updateMedia(id: string, data: MediaUpdate): Promise<Media> {
  const supabase = createServiceRoleClient();
  const { data: media, error } = await ((supabase
    .from("media") as any)
    .update(data)
    .eq("id", id)
    .select()
    .single() as Promise<{ data: any; error: any }>);

  if (error) {
    throw error;
  }

  if (!media) {
    throw new Error("Failed to update media");
  }

  return media;
}

/**
 * Delete a media record
 * This will cascade delete all section_media relationships
 * Uses service role client to bypass RLS for admin operations
 */
export async function deleteMedia(id: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

/**
 * Get all media for a specific section
 * Uses service role client to bypass RLS for admin operations
 */
export async function getMediaBySectionId(sectionId: string): Promise<Array<Media & { section_media: Database["public"]["Tables"]["section_media"]["Row"] }>> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("section_media")
    .select(`
      *,
      media (*)
    `)
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map((item: any) => ({
    ...item.media,
    section_media: {
      id: item.id,
      section_id: item.section_id,
      media_id: item.media_id,
      role: item.role,
      sort_order: item.sort_order,
      created_at: item.created_at,
    },
  }));
}
