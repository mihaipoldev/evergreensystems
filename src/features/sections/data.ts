import { createClient } from "@/lib/supabase/server";
import type { Section, SectionWithPages } from "./types";
import type { Database } from "@/lib/supabase/types";

type Page = Database["public"]["Tables"]["pages"]["Row"];

/**
 * Get all sections with their associated pages via page_sections junction table
 */
export async function getAllSections(): Promise<SectionWithPages[]> {
  const supabase = await createClient();
  
  // First get all sections
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .order("created_at", { ascending: false }) as { data: Database["public"]["Tables"]["sections"]["Row"][] | null; error: any };

  if (sectionsError) {
    throw sectionsError;
  }

  if (!sections || sections.length === 0) {
    return [];
  }

  // Then get all page_sections relationships for these sections
  const sectionIds = sections.map(s => s.id);
  const { data: pageSections, error: pageSectionsError } = await supabase
    .from("page_sections")
    .select(`
      id,
      section_id,
      position,
      visible,
      pages (
        id,
        slug,
        title
      )
    `)
    .in("section_id", sectionIds) as { data: Array<{
      id: string;
      section_id: string;
      position: number;
      visible: boolean;
      pages: { id: string; slug: string; title: string } | null;
    }> | null; error: any };

  if (pageSectionsError) {
    throw pageSectionsError;
  }

  // Combine sections with their pages
  return sections.map(section => {
    const associatedPages = (pageSections || [])
      .filter(ps => ps.section_id === section.id)
      .map(ps => ({
        id: (ps.pages as any)?.id || "",
        slug: (ps.pages as any)?.slug || "",
        title: (ps.pages as any)?.title || "",
        page_section_id: ps.id,
        position: ps.position,
        visible: ps.visible,
      }));

    return {
      ...section,
      pages: associatedPages,
    };
  });
}

/**
 * Get a single section by id
 */
export async function getSectionById(id: string): Promise<Section | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
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
 * Get all pages for dropdown selection
 */
export async function getAllPages(): Promise<Page[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
