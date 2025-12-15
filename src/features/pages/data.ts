import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Page } from "./types";

/**
 * Get all pages, ordered by creation date
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllPages(): Promise<Page[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("pages")
    .select("id, slug, title, description, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single page by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getPageById(id: string): Promise<Page | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("pages")
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
