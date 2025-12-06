import { createClient } from "./server";
import type { Database } from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Get a page by its slug
 * Returns null if page is not found (instead of throwing)
 */
export async function getPageBySlug(slug: string): Promise<Database["public"]["Tables"]["pages"]["Row"] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get all sections for a page via page_sections junction table, ordered by position
 */
export async function getSectionsByPageId(pageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select(`
      *,
      sections (*)
    `)
    .eq("page_id", pageId)
    .order("position", { ascending: true }) as { data: Array<{
      id: string;
      page_id: string;
      section_id: string;
      position: number;
      visible: boolean;
      sections: Database["public"]["Tables"]["sections"]["Row"] | null;
    }> | null; error: any };

  if (error) {
    throw error;
  }

  // Transform data to return sections with page_sections metadata
  return data
    ?.filter(ps => ps.sections !== null)
    .map(ps => ({
      ...(ps.sections as Database["public"]["Tables"]["sections"]["Row"]),
      page_section_id: ps.id,
      position: ps.position,
      visible: ps.visible,
    })) || [];
}

/**
 * Reorder items in a table by updating their positions
 * @param table - Table name
 * @param items - Array of { id, position } objects
 */
export async function reorderItems(
  table: "page_sections" | "cta_buttons" | "offer_features" | "testimonials" | "faq_items",
  items: Array<{ id: string; position: number }>
) {
  const supabase = await createClient();
  const tableName = table as keyof Database["public"]["Tables"];

  const updates = items.map((item) =>
    (supabase
      .from(tableName) as any)
      .update({ position: item.position })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((result) => result.error);

  if (errors.length > 0) {
    throw errors[0].error;
  }

  return results;
}

/**
 * Get all visible sections for a page (public-facing)
 */
export async function getVisibleSectionsByPageId(pageId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select(`
      *,
      sections (*)
    `)
    .eq("page_id", pageId)
    .eq("visible", true)
    .order("position", { ascending: true }) as { data: Array<{
      id: string;
      page_id: string;
      section_id: string;
      position: number;
      visible: boolean;
      sections: Database["public"]["Tables"]["sections"]["Row"] | null;
    }> | null; error: any };

  if (error) {
    throw error;
  }

  // Transform data to return sections with page_sections metadata
  return data
    ?.filter(ps => ps.sections !== null)
    .map(ps => ({
      ...(ps.sections as Database["public"]["Tables"]["sections"]["Row"]),
      page_section_id: ps.id,
      position: ps.position,
      visible: ps.visible,
    })) || [];
}

/**
 * Get all approved testimonials (public-facing)
 */
export async function getApprovedTestimonials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("approved", true)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get all FAQ items (public-facing)
 */
export async function getAllFAQItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Add a section to a page
 */
export async function addSectionToPage(
  pageId: string,
  sectionId: string,
  position: number = 0,
  visible: boolean = true
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .insert({
      page_id: pageId,
      section_id: sectionId,
      position,
      visible,
    } as any)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Remove a section from a page
 */
export async function removeSectionFromPage(pageId: string, sectionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("page_sections")
    .delete()
    .eq("page_id", pageId)
    .eq("section_id", sectionId);

  if (error) {
    throw error;
  }
}

/**
 * Update a page-section relationship
 */
export async function updatePageSection(
  pageSectionId: string,
  updates: { position?: number; visible?: boolean }
) {
  const supabase = await createClient();
  const { data, error } = await ((supabase
    .from("page_sections") as any)
    .update(updates)
    .eq("id", pageSectionId)
    .select()
    .single());

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get a section by type (e.g., "faq", "hero", "testimonials")
 */
export async function getSectionByType(type: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("type", type)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
