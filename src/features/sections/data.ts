import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Section, SectionWithPages } from "./types";
import type { Database } from "@/lib/supabase/types";

type Page = Database["public"]["Tables"]["pages"]["Row"];

/**
 * Get all sections with their associated pages via page_sections junction table
 * Ordered by: home page sections (by position) first, then non-home sections (alphabetically)
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllSections(): Promise<SectionWithPages[]> {
  const supabase = createServiceRoleClient();
  
  // Get the home page
  const { data: homePage, error: homePageError } = await ((supabase
    .from("pages") as any)
    .select("id")
    .eq("slug", "home")
    .maybeSingle() as Promise<{ data: { id: string } | null; error: any }>);

  if (homePageError) {
    throw homePageError;
  }

  // Get all sections
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, type, title, admin_title, subtitle, content, media_url, icon, created_at, updated_at") as { 
      data: Array<Database["public"]["Tables"]["sections"]["Row"] & { icon: string | null }> | null; 
      error: any 
    };

  if (sectionsError) {
    throw sectionsError;
  }

  if (!sections || sections.length === 0) {
    return [];
  }

  // Get all page_sections relationships for these sections
  const sectionIds = sections.map(s => s.id);
  const queryResult = await ((supabase
    .from("page_sections") as any)
    .select(`
      id,
      section_id,
      position,
      status,
      page_id,
      pages (
        id,
        slug,
        title
      )
    `)
    .in("section_id", sectionIds) as Promise<{ data: Array<{
      id: string;
      section_id: string;
      position: number;
      status: "published" | "draft" | "deactivated";
      page_id: string;
      pages: { id: string; slug: string; title: string } | null;
    }> | null; error: any }>);
  const { data: pageSections, error: pageSectionsError } = queryResult;

  if (pageSectionsError) {
    throw pageSectionsError;
  }

  // Combine sections with their pages
  type PageSection = {
    id: string;
    section_id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    page_id: string;
    pages: { id: string; slug: string; title: string } | null;
  };
  const typedPageSections: PageSection[] = (pageSections || []) as PageSection[];
  const sectionsWithPages: SectionWithPages[] = sections.map(section => {
    const associatedPages = typedPageSections
      .filter(ps => ps.section_id === section.id)
      .map(ps => ({
        id: (ps.pages as any)?.id || "",
        slug: (ps.pages as any)?.slug || "",
        title: (ps.pages as any)?.title || "",
        page_section_id: ps.id,
        position: ps.position,
        status: ps.status,
      }));

    return {
      ...section,
      icon: (section as any).icon ?? null,
      pages: associatedPages,
    } as SectionWithPages;
  });

  // Separate sections into home page sections and non-home sections
  const homePageSectionIds = new Set(
    typedPageSections
      .filter(ps => homePage && ps.page_id === homePage.id)
      .sort((a, b) => a.position - b.position)
      .map(ps => ps.section_id)
  );

  const homePageSections: SectionWithPages[] = [];
  const nonHomeSections: SectionWithPages[] = [];

  sectionsWithPages.forEach(section => {
    if (homePageSectionIds.has(section.id)) {
      homePageSections.push(section);
    } else {
      nonHomeSections.push(section);
    }
  });

  // Sort home page sections by their position on the home page
  homePageSections.sort((a, b) => {
    const aPosition = a.pages?.find(p => homePage && p.id === homePage.id)?.position ?? Infinity;
    const bPosition = b.pages?.find(p => homePage && p.id === homePage.id)?.position ?? Infinity;
    return aPosition - bPosition;
  });

  // Sort non-home sections alphabetically by admin_title (fallback to title, then type)
  nonHomeSections.sort((a, b) => {
    const aTitle = (a.admin_title || a.title || a.type || "").toLowerCase();
    const bTitle = (b.admin_title || b.title || b.type || "").toLowerCase();
    return aTitle.localeCompare(bTitle);
  });

  // Return home page sections first, then non-home sections
  return [...homePageSections, ...nonHomeSections];
}

/**
 * Get a single section by id with media
 * Uses service role client to bypass RLS for admin operations
 */
export async function getSectionById(id: string): Promise<Section | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await ((supabase
    .from("sections") as any)
    .select("id, type, title, admin_title, subtitle, content, media_url, icon, created_at, updated_at")
    .eq("id", id)
    .single() as Promise<{ data: Database["public"]["Tables"]["sections"]["Row"] | null; error: any }>);

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  // Get media for this section
  const { data: sectionMediaData, error: mediaError } = await supabase
    .from("section_media")
    .select(`
      *,
      media (*)
    `)
    .eq("section_id", id)
    .order("sort_order", { ascending: true });

  if (mediaError) {
    console.error("Error fetching section media:", mediaError);
    // Return section without media if there's an error
    return data as Section;
  }

  // Transform media data
  const media = (sectionMediaData || []).map((item: any) => ({
    ...item.media,
    section_media: {
      id: item.id,
      section_id: item.section_id,
      media_id: item.media_id,
      role: item.role,
      sort_order: item.sort_order,
      created_at: item.created_at,
    },
  }));

  // Get CTA buttons for this section
  const { data: sectionCTAData, error: ctaError } = await supabase
    .from("section_cta_buttons")
    .select(`
      *,
      cta_buttons (*)
    `)
    .eq("section_id", id)
    .order("position", { ascending: true });

  if (ctaError) {
    console.error("Error fetching section CTA buttons:", ctaError);
    // Return section without CTAs if there's an error
    return {
      ...data,
      media,
    } as Section;
  }

  // Transform CTA button data (filter based on environment)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const ctaButtons = (sectionCTAData || [])
    .filter((item: any) => {
      const ctaStatus = item.cta_buttons?.status;
      return isDevelopment 
        ? (ctaStatus === "published" || ctaStatus === "draft")
        : ctaStatus === "published";
    })
    .map((item: any) => ({
      ...item.cta_buttons,
      section_cta_button: {
        id: item.id,
        position: item.position,
        created_at: item.created_at,
      },
    }));

  return {
    ...data,
    media,
    ctaButtons,
  } as Section;
}

/**
 * Get all pages for dropdown selection
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllPages(): Promise<Page[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
