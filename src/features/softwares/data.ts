import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Software } from "./types";

/**
 * Get all softwares, ordered by name
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllSoftwares(): Promise<Software[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("softwares")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single software by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getSoftwareById(id: string): Promise<Software | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("softwares")
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
