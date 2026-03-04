import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Media, MediaInsert, MediaUpdate } from "./types";

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

