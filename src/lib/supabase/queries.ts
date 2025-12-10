import { createClient } from "./server";
import type { Database } from "./types";
import type { CTAButtonWithSection } from "@/features/cta/types";
import { unstable_cache } from "next/cache";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Get a page by its slug
 * Returns null if page is not found (instead of throwing)
 * Cached for 5 minutes to improve performance
 */
export async function getPageBySlug(slug: string): Promise<Database["public"]["Tables"]["pages"]["Row"] | null> {
  return unstable_cache(
    async () => {
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
    },
    [`page-by-slug-${slug}`],
    {
      revalidate: 60, // 1 minute
      tags: ['pages', `page-${slug}`],
    }
  )();
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
 * Get all visible sections for a page (public-facing) with media
 * Cached for 5 minutes to improve performance
 */
export async function getVisibleSectionsByPageId(pageId: string) {
  return unstable_cache(
    async () => {
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

  if (!data) {
    return [];
  }

  // Get all section IDs
  const sectionIds = data
    .filter(ps => ps.sections !== null)
    .map(ps => ps.section_id);

  // Get media for all sections
  const { data: sectionMediaData } = await supabase
    .from("section_media")
    .select(`
      *,
      media (*)
    `)
    .in("section_id", sectionIds)
    .order("sort_order", { ascending: true });

  // Group media by section_id
  const mediaBySectionId = new Map<string, any[]>();
  (sectionMediaData || []).forEach((item: any) => {
    if (!mediaBySectionId.has(item.section_id)) {
      mediaBySectionId.set(item.section_id, []);
    }
    mediaBySectionId.get(item.section_id)!.push({
      ...item.media,
      section_media: {
        id: item.id,
        section_id: item.section_id,
        media_id: item.media_id,
        role: item.role,
        sort_order: item.sort_order,
        created_at: item.created_at,
      },
    });
  });

  // Get CTA buttons for all sections
  const { data: sectionCTAData } = await supabase
    .from("section_cta_buttons")
    .select(`
      *,
      cta_buttons (*)
    `)
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  // Group CTA buttons by section_id (filter to only active ones)
  const ctaButtonsBySectionId = new Map<string, CTAButtonWithSection[]>();
  (sectionCTAData || []).forEach((item: any) => {
    // Filter out deactivated CTAs
    if (item.cta_buttons && item.cta_buttons.status === "active") {
      if (!ctaButtonsBySectionId.has(item.section_id)) {
        ctaButtonsBySectionId.set(item.section_id, []);
      }
      const ctaButton: CTAButtonWithSection = {
        ...item.cta_buttons,
        status: item.cta_buttons.status as "active" | "deactivated",
        section_cta_button: {
          id: item.id,
          position: item.position,
          created_at: item.created_at,
        },
      };
      ctaButtonsBySectionId.get(item.section_id)!.push(ctaButton);
    }
  });

      // Transform data to return sections with page_sections metadata, media, and CTA buttons
      return data
        .filter(ps => ps.sections !== null)
        .map(ps => ({
          ...(ps.sections as Database["public"]["Tables"]["sections"]["Row"]),
          page_section_id: ps.id,
          position: ps.position,
          visible: ps.visible,
          media: mediaBySectionId.get(ps.section_id) || [],
          ctaButtons: ctaButtonsBySectionId.get(ps.section_id) || [],
        }));
    },
    [`visible-sections-${pageId}`],
    {
      revalidate: 60, // 1 minute
      tags: ['sections', `page-sections-${pageId}`],
    }
  )();
}

/**
 * Get all approved testimonials (public-facing)
 * Cached for 5 minutes to improve performance
 */
export async function getApprovedTestimonials() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, author_name, author_role, company_name, headline, quote, avatar_url, rating, approved, position, created_at, updated_at")
        .eq("approved", true)
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
    ['approved-testimonials'],
    {
      revalidate: 60, // 1 minute
      tags: ['testimonials'],
    }
  )();
}

/**
 * Get all active FAQ items (public-facing)
 * Uses anon key with RLS - only returns active items
 * Cached for 5 minutes to improve performance
 */
export async function getAllFAQItems() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("faq_items")
        .select("id, question, answer, position, status, created_at, updated_at")
        .eq("status", "active")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
    ['all-faq-items'],
    {
      revalidate: 60, // 1 minute
      tags: ['faq-items'],
    }
  )();
}

/**
 * Get all active offer features (public-facing)
 * Uses anon key with RLS - only returns active features
 * RLS policy automatically filters to status = 'active'
 * Cached for 5 minutes to improve performance
 */
export async function getActiveOfferFeatures() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      // RLS policy "Public can view active offer_features" automatically filters to status = 'active'
      // No need for explicit .eq() filter - RLS handles it
      const { data, error } = await supabase
        .from("offer_features")
        .select("id, title, subtitle, description, icon, position, status, created_at, updated_at")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      // Double-check: filter out any inactive items (defensive programming)
      // RLS should handle this, but this ensures we never return inactive items
      return ((data || []) as any[]).filter((feature: any) => feature.status === "active");
    },
    ['active-offer-features'],
    {
      revalidate: 60, // 1 minute
      tags: ['offer-features'],
    }
  )();
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
