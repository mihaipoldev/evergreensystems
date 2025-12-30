import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Software } from "./types";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";

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

/**
 * Get all softwares for a specific section via section_softwares junction table
 */
export async function getSoftwaresBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const { data, error } = await supabase
    .from("section_softwares")
    .select(`
      *,
      softwares (*)
    `)
    .eq("section_id", sectionId)
    .order("order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.softwares) return false;
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.softwares,
      section_software: {
        id: item.id,
        order: item.order,
        icon_override: item.icon_override,
        status: (item.status || "published") as "published" | "draft" | "deactivated",
        created_at: item.created_at,
      },
    }));
}
