import { createServiceRoleClient } from "@/lib/supabase/server";
import type { CTAButton, CTAButtonWithSection, CTAButtonWithSections } from "./types";
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
 * Get all CTA buttons with connected sections (for admin UI)
 * Includes sections (id, title, admin_title) where the CTA is used
 */
export async function getAllCTAButtonsWithSections(): Promise<CTAButtonWithSections[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cta_buttons")
    .select(`
      id, label, url, style, icon, position, status, created_at, updated_at,
      section_cta_buttons(
        section_id,
        sections (
          id,
          title,
          admin_title
        )
      )
    `)
    .order("position", { ascending: true }) as unknown as { data: any[] | null; error: any };

  if (error) {
    throw error;
  }

  if (!data) return [];

  return data.map((btn) => {
    const sections =
      btn.section_cta_buttons
        ?.map((item: any) => item.sections)
        ?.filter((s: any) => !!s)
        ?.map((s: any) => ({
          id: s.id,
          title: s.title,
          admin_title: s.admin_title,
          page_section_id: undefined,
        })) || [];

    return {
      id: btn.id,
      label: btn.label,
      url: btn.url,
      style: btn.style,
      icon: btn.icon,
      position: btn.position,
      status: btn.status,
      created_at: btn.created_at,
      updated_at: btn.updated_at,
      sections,
    };
  });
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
export async function getCTAButtonById(id: string): Promise<(CTAButton & { section_id: string | null }) | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("cta_buttons")
    .select(`
      id, label, url, style, icon, position, status, created_at, updated_at,
      section_cta_buttons (
        section_id
      )
    `)
    .eq("id", id)
    .single() as unknown as { data: any | null; error: any };

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw error;
  }

  if (!data) return null;

  const sectionId =
    data.section_cta_buttons && data.section_cta_buttons.length > 0
      ? data.section_cta_buttons[0]?.section_id || null
      : null;

  return {
    id: data.id,
    label: data.label,
    url: data.url,
    style: data.style,
    icon: data.icon,
    position: data.position,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    section_id: sectionId,
  };
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
