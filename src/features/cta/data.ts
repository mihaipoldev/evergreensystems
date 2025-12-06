import { createClient } from "@/lib/supabase/server";
import type { CTAButton, CTAButtonWithSection } from "./types";
import type { Database } from "@/lib/supabase/types";

/**
 * Get all CTA buttons, ordered by position
 */
export async function getAllCTAButtons(): Promise<CTAButton[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cta_buttons")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all active CTA buttons, ordered by position
 */
export async function getActiveCTAButtons(): Promise<CTAButton[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cta_buttons")
    .select("*")
    .eq("status", "active")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single CTA button by id
 */
export async function getCTAButtonById(id: string): Promise<CTAButton | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cta_buttons")
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

  return data || null;
}

/**
 * Get all CTA buttons for a specific section
 */
export async function getCTAButtonsBySectionId(sectionId: string): Promise<CTAButtonWithSection[]> {
  const supabase = await createClient();
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
