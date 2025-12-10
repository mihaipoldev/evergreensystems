import { createServiceRoleClient } from "@/lib/supabase/server";
import type { CTAButton, CTAButtonWithSection } from "./types";
import type { Database } from "@/lib/supabase/types";

/**
 * Get all CTA buttons, ordered by position
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllCTAButtons(): Promise<CTAButton[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cta_buttons")
    .select("id, label, url, style, icon, position, status, created_at, updated_at")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all active CTA buttons, ordered by position
 * Uses service role client to bypass RLS for admin operations
 */
export async function getActiveCTAButtons(): Promise<CTAButton[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cta_buttons")
    .select("id, label, url, style, icon, position, status, created_at, updated_at")
    .eq("status", "active")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single CTA button by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getCTAButtonById(id: string): Promise<CTAButton | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cta_buttons")
    .select("id, label, url, style, icon, position, status, created_at, updated_at")
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
 * Get all CTA buttons for a specific section
 * Uses service role client to bypass RLS for admin operations
 */
export async function getCTAButtonsBySectionId(sectionId: string): Promise<CTAButtonWithSection[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("section_cta_buttons")
    .select(`
      *,
      cta_buttons (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map((item: any) => ({
    ...item.cta_buttons,
    section_cta_button: {
      id: item.id,
      position: item.position,
      created_at: item.created_at,
    },
  }));
}
