import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Section, SectionWithPages } from "./types";
import type { CTAButtonWithSection } from "@/features/page-builder/cta/types";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";
import { unstable_cache } from "next/cache";

type Page = Database["public"]["Tables"]["pages"]["Row"];

/**
 * Get all sections with their associated pages via page_sections junction table
 * Ordered by: home page sections (by position) first, then non-home sections (alphabetically)
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllSections(): Promise<SectionWithPages[]> {
  const supabase = createServiceRoleClient();
  
  // Get the home page by type
  const { data: homePage, error: homePageError } = await ((supabase
    .from("pages") as any)
    .select("id")
    .eq("type", "home")
    .maybeSingle() as Promise<{ data: { id: string } | null; error: any }>);

  if (homePageError) {
    throw homePageError;
  }

  // Get all sections
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, type, title, admin_title, header_title, subtitle, eyebrow, content, media_url, icon, created_at, updated_at") as { 
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
        title
      )
    `)
    .in("section_id", sectionIds) as Promise<{ data: Array<{
      id: string;
      section_id: string;
      position: number;
      status: "published" | "draft" | "deactivated";
      page_id: string;
      pages: { id: string; title: string } | null;
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
    pages: { id: string; title: string } | null;
  };
  const typedPageSections: PageSection[] = (pageSections || []) as PageSection[];
  const sectionsWithPages: SectionWithPages[] = sections.map(section => {
    const associatedPages = typedPageSections
      .filter(ps => ps.section_id === section.id)
      .map(ps => ({
        id: (ps.pages as any)?.id || "",
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
    .select("id, type, title, admin_title, header_title, subtitle, eyebrow, content, media_url, icon, created_at, updated_at")
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


// Functions from queries.ts
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
      status: "published" | "draft" | "deactivated";
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
      status: ps.status,
    })) || [];
}

export async function getFirstPageIdBySectionId(sectionId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("page_id")
    .eq("section_id", sectionId)
    .limit(1);

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? (data[0] as { page_id: string }).page_id : null;
}

/**
 * Get page_section status and id for a specific page and section
 * Returns null if the relationship doesn't exist
 */
export async function getPageSectionStatus(
  pageId: string,
  sectionId: string
): Promise<{ id: string; status: "published" | "draft" | "deactivated" } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .select("id, status")
    .eq("page_id", pageId)
    .eq("section_id", sectionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const typedData = data as { id: string; status: "published" | "draft" | "deactivated" };
  return {
    id: typedData.id,
    status: (typedData.status || "draft") as "published" | "draft" | "deactivated",
  };
}

export async function getVisibleSectionsByPageId(pageId: string) {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      // In development mode, show both published and draft sections
      // In production, only show published sections
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Fetch all page_sections - filtering will be done at application level
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
          status: "published" | "draft" | "deactivated";
          sections: Database["public"]["Tables"]["sections"]["Row"] | null;
        }> | null; error: any };

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  // Filter page_sections based on status and environment (using helper function)
  const filteredPageSections = data.filter((ps) => {
    if (!ps.sections) return false; // Exclude if section is null
    return shouldIncludeItemByStatus(ps.status, isDevelopment);
  });

  // Get all section IDs from filtered page sections
  const sectionIds = filteredPageSections
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

  // Group media by section_id (filter based on environment)
  const mediaBySectionId = new Map<string, any[]>();
  (sectionMediaData || []).forEach((item: any) => {
    // Filter media based on status from junction table and environment
    if (item.media && shouldIncludeItemByStatus(item.status, isDevelopment)) {
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
          status: item.status as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      });
    }
  });

  // Get CTA buttons for all sections
  // Query junction table first, then join with base table separately to avoid RLS join issues
  const { data: sectionCTAData } = await supabase
    .from("section_cta_buttons")
    .select("*")
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  console.log('[DEBUG] CTA Junction Query:', {
    sectionIds,
    sectionIdsCount: sectionIds.length,
    sectionCTADataCount: sectionCTAData?.length || 0,
    sampleJunctionItem: sectionCTAData?.[0] ? {
      id: (sectionCTAData[0] as any).id,
      section_id: (sectionCTAData[0] as any).section_id,
      cta_button_id: (sectionCTAData[0] as any).cta_button_id,
      status: (sectionCTAData[0] as any).status,
    } : null,
  });

  // Get all CTA button IDs from junction table
  const ctaButtonIds = sectionCTAData?.map((item: any) => item.cta_button_id).filter(Boolean) || [];
  
  // Query CTA buttons separately
  // Use regular client - RLS policies should allow public access
  const { data: ctaButtonsData } = await supabase
    .from("cta_buttons")
    .select("*")
    .in("id", ctaButtonIds);

  console.log('[DEBUG] CTA Base Query:', {
    ctaButtonIds,
    ctaButtonIdsCount: ctaButtonIds.length,
    ctaButtonsDataCount: ctaButtonsData?.length || 0,
    sampleCTAButton: ctaButtonsData?.[0] ? {
      id: (ctaButtonsData[0] as any).id,
      label: (ctaButtonsData[0] as any).label,
      url: (ctaButtonsData[0] as any).url,
    } : null,
  });

  // Create a map of cta_button_id -> cta_button for quick lookup
  const ctaButtonsMap = new Map((ctaButtonsData || []).map((c: any) => [c.id, c]));

  // Group CTA buttons by section_id (filter based on environment)
  const ctaButtonsBySectionId = new Map<string, CTAButtonWithSection[]>();
  let ctaIncludedCount = 0;
  let ctaExcludedCount = 0;
  
  (sectionCTAData || []).forEach((item: any) => {
    const ctaButton = ctaButtonsMap.get(item.cta_button_id);
    
    if (!ctaButton) {
      console.log('[DEBUG] CTA excluded - not found in ctaButtonsMap:', {
        junctionId: item.id,
        cta_button_id: item.cta_button_id,
        availableCTAButtonIds: Array.from(ctaButtonsMap.keys()),
      });
      ctaExcludedCount++;
      return;
    }
    
    // Filter CTAs based on status from junction table and environment
    const shouldInclude = shouldIncludeItemByStatus(item.status, isDevelopment);
    
    console.log('[DEBUG] CTA filtering decision:', {
      junctionId: item.id,
      section_id: item.section_id,
      cta_button_id: item.cta_button_id,
      ctaLabel: ctaButton.label,
      status: item.status,
      shouldInclude,
      isDevelopment,
    });
    
    if (shouldInclude) {
      ctaIncludedCount++;
      if (!ctaButtonsBySectionId.has(item.section_id)) {
        ctaButtonsBySectionId.set(item.section_id, []);
      }
      const ctaButtonWithSection: CTAButtonWithSection = {
        ...ctaButton,
        section_cta_button: {
          id: item.id,
          position: item.position,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      ctaButtonsBySectionId.get(item.section_id)!.push(ctaButtonWithSection);
    } else {
      ctaExcludedCount++;
    }
  });

  console.log('[DEBUG] CTA Summary:', {
    totalItems: sectionCTAData?.length || 0,
    includedCount: ctaIncludedCount,
    excludedCount: ctaExcludedCount,
    ctaButtonsBySectionIdSize: ctaButtonsBySectionId.size,
    ctaButtonsBySectionIdKeys: Array.from(ctaButtonsBySectionId.keys()),
    ctaCounts: Array.from(ctaButtonsBySectionId.entries()).map(([sectionId, ctas]) => ({
      sectionId,
      count: ctas.length,
    })),
  });

  // Get features for all sections
  // Query junction table first, then join with base table separately to avoid RLS join issues
  const { data: sectionFeaturesData } = await supabase
    .from("section_features")
    .select("*")
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  // Get all feature IDs from junction table
  const featureIds = sectionFeaturesData?.map((item: any) => item.feature_id).filter(Boolean) || [];
  
  // Query features separately
  // Use regular client - RLS policies should allow public access
  const { data: featuresData } = await supabase
    .from("offer_features")
    .select("*")
    .in("id", featureIds);

  // Create a map of feature_id -> feature for quick lookup
  const featuresMap = new Map((featuresData || []).map((f: any) => [f.id, f]));

  // Group features by section_id (filter based on environment)
  const featuresBySectionId = new Map<string, any[]>();
  
  (sectionFeaturesData || []).forEach((item: any) => {
    const feature = featuresMap.get(item.feature_id);
    
    if (!feature) {
      return;
    }
    
    // Filter features based on status from junction table and environment
    if (shouldIncludeItemByStatus(item.status, isDevelopment)) {
      if (!featuresBySectionId.has(item.section_id)) {
        featuresBySectionId.set(item.section_id, []);
      }
      const featureWithSection = {
        ...feature,
        section_feature: {
          id: item.id,
          position: item.position,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      featuresBySectionId.get(item.section_id)!.push(featureWithSection);
    }
  });

  // Get FAQ items for all sections
  // Query junction table first, then join with base table separately to avoid RLS join issues
  const { data: sectionFAQData } = await supabase
    .from("section_faq_items")
    .select("*")
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  // Get all FAQ item IDs from junction table
  const faqItemIds = sectionFAQData?.map((item: any) => item.faq_item_id).filter(Boolean) || [];
  
  // Query FAQ items separately
  // Use regular client - RLS policies should allow public access
  const { data: faqItemsData } = await supabase
    .from("faq_items")
    .select("*")
    .in("id", faqItemIds);

  // Create a map of faq_item_id -> faq_item for quick lookup
  const faqItemsMap = new Map((faqItemsData || []).map((f: any) => [f.id, f]));

  // Group FAQ items by section_id (filter based on environment)
  const faqItemsBySectionId = new Map<string, any[]>();
  
  (sectionFAQData || []).forEach((item: any) => {
    const faqItem = faqItemsMap.get(item.faq_item_id);
    
    if (!faqItem) {
      return;
    }
    
    // Filter FAQ items based on status from junction table and environment
    if (shouldIncludeItemByStatus(item.status, isDevelopment)) {
      if (!faqItemsBySectionId.has(item.section_id)) {
        faqItemsBySectionId.set(item.section_id, []);
      }
      const faqItemWithSection = {
        ...faqItem,
        section_faq_item: {
          id: item.id,
          position: item.position,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      faqItemsBySectionId.get(item.section_id)!.push(faqItemWithSection);
    }
  });

  // Get Timeline items for all sections
  const { data: sectionTimelineData } = await supabase
    .from("section_timeline")
    .select(`
      *,
      timeline (*)
    `)
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  // Group Timeline items by section_id (filter based on environment)
  const timelineItemsBySectionId = new Map<string, any[]>();
  (sectionTimelineData || []).forEach((item: any) => {
    // Filter timeline items based on status from junction table and environment
    if (item.timeline && shouldIncludeItemByStatus(item.status, isDevelopment)) {
      if (!timelineItemsBySectionId.has(item.section_id)) {
        timelineItemsBySectionId.set(item.section_id, []);
      }
      const timelineItem = {
        ...item.timeline,
        section_timeline: {
          id: item.id,
          position: item.position,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      timelineItemsBySectionId.get(item.section_id)!.push(timelineItem);
    }
  });

  // Get Testimonials for all sections
  // Query junction table first, then join with base table separately to avoid RLS join issues
  const { data: sectionTestimonialsData } = await supabase
    .from("section_testimonials")
    .select("*")
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  console.log('[DEBUG] Testimonials Junction Query:', {
    sectionIds,
    sectionIdsCount: sectionIds.length,
    sectionTestimonialsDataCount: sectionTestimonialsData?.length || 0,
    sampleJunctionItem: sectionTestimonialsData?.[0] ? {
      id: (sectionTestimonialsData[0] as any).id,
      section_id: (sectionTestimonialsData[0] as any).section_id,
      testimonial_id: (sectionTestimonialsData[0] as any).testimonial_id,
      status: (sectionTestimonialsData[0] as any).status,
    } : null,
  });

  // Get all testimonial IDs from junction table
  const testimonialIds = sectionTestimonialsData?.map((item: any) => item.testimonial_id).filter(Boolean) || [];
  
  // Query testimonials separately
  // Use regular client - RLS policies should allow public access
  const { data: testimonialsData } = await supabase
    .from("testimonials")
    .select("*")
    .in("id", testimonialIds);

  console.log('[DEBUG] Testimonials Base Query:', {
    testimonialIds,
    testimonialIdsCount: testimonialIds.length,
    testimonialsDataCount: testimonialsData?.length || 0,
    sampleTestimonial: testimonialsData?.[0] ? {
      id: (testimonialsData[0] as any).id,
      author_name: (testimonialsData[0] as any).author_name,
      quote: (testimonialsData[0] as any).quote?.substring(0, 50),
    } : null,
  });

  // Create a map of testimonial_id -> testimonial for quick lookup
  const testimonialsMap = new Map((testimonialsData || []).map((t: any) => [t.id, t]));

  // Group Testimonials by section_id (filter based on environment)
  const testimonialsBySectionId = new Map<string, any[]>();
  let testimonialsIncludedCount = 0;
  let testimonialsExcludedCount = 0;
  
  (sectionTestimonialsData || []).forEach((item: any) => {
    const testimonial = testimonialsMap.get(item.testimonial_id);
    
    if (!testimonial) {
      console.log('[DEBUG] Testimonial excluded - not found in testimonialsMap:', {
        junctionId: item.id,
        testimonial_id: item.testimonial_id,
        availableTestimonialIds: Array.from(testimonialsMap.keys()),
      });
      testimonialsExcludedCount++;
      return;
    }
    
    // Filter testimonials based on status from junction table and environment
    const shouldInclude = shouldIncludeItemByStatus(item.status, isDevelopment);
    
    console.log('[DEBUG] Testimonial filtering decision:', {
      junctionId: item.id,
      section_id: item.section_id,
      testimonial_id: item.testimonial_id,
      testimonialAuthor: testimonial.author_name,
      status: item.status,
      shouldInclude,
      isDevelopment,
    });
    
    if (shouldInclude) {
      testimonialsIncludedCount++;
      if (!testimonialsBySectionId.has(item.section_id)) {
        testimonialsBySectionId.set(item.section_id, []);
      }
      const testimonialWithSection = {
        ...testimonial,
        section_testimonial: {
          id: item.id,
          position: item.position,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      testimonialsBySectionId.get(item.section_id)!.push(testimonialWithSection);
    } else {
      testimonialsExcludedCount++;
    }
  });

  console.log('[DEBUG] Testimonials Summary:', {
    totalItems: sectionTestimonialsData?.length || 0,
    includedCount: testimonialsIncludedCount,
    excludedCount: testimonialsExcludedCount,
    testimonialsBySectionIdSize: testimonialsBySectionId.size,
    testimonialsBySectionIdKeys: Array.from(testimonialsBySectionId.keys()),
    testimonialCounts: Array.from(testimonialsBySectionId.entries()).map(([sectionId, testimonials]) => ({
      sectionId,
      count: testimonials.length,
    })),
  });

  // Get Results for all sections
  const { data: sectionResultsData } = await supabase
    .from("section_results")
    .select(`
      *,
      results (*)
    `)
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  // Group Results by section_id (filter based on environment)
  const resultsBySectionId = new Map<string, any[]>();
  (sectionResultsData || []).forEach((item: any) => {
    // Filter results based on status from junction table and environment
    if (item.results && shouldIncludeItemByStatus(item.status, isDevelopment)) {
      if (!resultsBySectionId.has(item.section_id)) {
        resultsBySectionId.set(item.section_id, []);
      }
      const result = {
        ...item.results,
        section_result: {
          id: item.id,
          position: item.position,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      resultsBySectionId.get(item.section_id)!.push(result);
    }
  });

  // Get Softwares for all sections
  // Query junction table first, then join with base table separately to avoid RLS join issues
  const { data: sectionSoftwaresData } = await supabase
    .from("section_softwares")
    .select("*")
    .in("section_id", sectionIds)
    .order("order", { ascending: true });

  // Get all software IDs from junction table
  const softwareIds = sectionSoftwaresData?.map((item: any) => item.software_id).filter(Boolean) || [];
  
  // Query softwares separately
  // Use regular client - RLS policies should allow public access
  const { data: softwaresData } = await supabase
    .from("softwares")
    .select("*")
    .in("id", softwareIds);

  // Create a map of software_id -> software for quick lookup
  const softwaresMap = new Map((softwaresData || []).map((s: any) => [s.id, s]));

  // Group softwares by section_id (filter based on environment)
  const softwaresBySectionId = new Map<string, any[]>();
  
  (sectionSoftwaresData || []).forEach((item: any) => {
    const software = softwaresMap.get(item.software_id);
    
    if (!software) {
      return;
    }
    
    // Filter softwares based on status from junction table and environment
    if (shouldIncludeItemByStatus(item.status, isDevelopment)) {
      if (!softwaresBySectionId.has(item.section_id)) {
        softwaresBySectionId.set(item.section_id, []);
      }
      const softwareWithSection = {
        ...software,
        section_software: {
          id: item.id,
          order: item.order,
          icon_override: item.icon_override,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      softwaresBySectionId.get(item.section_id)!.push(softwareWithSection);
    }
  });

  // Get Social Platforms for all sections
  // Query junction table first, then join with base table separately to avoid RLS join issues
  const { data: sectionSocialsData } = await supabase
    .from("section_socials")
    .select("*")
    .in("section_id", sectionIds)
    .order("order", { ascending: true });

  // Get all platform IDs from junction table
  const platformIds = sectionSocialsData?.map((item: any) => item.platform_id).filter(Boolean) || [];
  
  // Query social platforms separately
  // Use regular client - RLS policies should allow public access
  const { data: socialPlatformsData } = await supabase
    .from("social_platforms")
    .select("*")
    .in("id", platformIds);

  // Create a map of platform_id -> platform for quick lookup
  const socialPlatformsMap = new Map((socialPlatformsData || []).map((p: any) => [p.id, p]));

  // Group social platforms by section_id (filter based on environment)
  const socialPlatformsBySectionId = new Map<string, any[]>();
  
  (sectionSocialsData || []).forEach((item: any) => {
    const platform = socialPlatformsMap.get(item.platform_id);
    
    if (!platform) {
      return;
    }
    
    // Filter social platforms based on status from junction table and environment
    if (shouldIncludeItemByStatus(item.status, isDevelopment)) {
      if (!socialPlatformsBySectionId.has(item.section_id)) {
        socialPlatformsBySectionId.set(item.section_id, []);
      }
      const platformWithSection = {
        ...platform,
        section_social: {
          id: item.id,
          order: item.order,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
      socialPlatformsBySectionId.get(item.section_id)!.push(platformWithSection);
    }
  });

      // Transform data to return sections with page_sections metadata, media, CTA buttons, features, FAQ items, timeline items, testimonials, results, softwares, and social platforms
      // Use filteredPageSections instead of data to ensure status filtering is applied
      const transformedSections = filteredPageSections
        .map(ps => {
          const sectionId = ps.section_id;
          const features = featuresBySectionId.get(sectionId) || [];
          const faqItems = faqItemsBySectionId.get(sectionId) || [];
          
          return {
            ...(ps.sections as Database["public"]["Tables"]["sections"]["Row"]),
            page_section_id: ps.id,
            position: ps.position,
            status: ps.status,
            media: mediaBySectionId.get(sectionId) || [],
            ctaButtons: ctaButtonsBySectionId.get(sectionId) || [],
            features,
            faqItems,
            timelineItems: timelineItemsBySectionId.get(sectionId) || [],
            testimonials: testimonialsBySectionId.get(sectionId) || [],
            results: resultsBySectionId.get(sectionId) || [],
            softwares: softwaresBySectionId.get(sectionId) || [],
            socialPlatforms: socialPlatformsBySectionId.get(sectionId) || [],
          };
        });

      return transformedSections;
    },
    [`published-sections-${pageId}`],
    {
      revalidate: 60, // 1 minute
      tags: ['sections', `page-sections-${pageId}`],
    }
  )();
}

export async function addSectionToPage(
  pageId: string,
  sectionId: string,
  position: number = 0,
  status: "published" | "draft" | "deactivated" = "draft"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_sections")
    .insert({
      page_id: pageId,
      section_id: sectionId,
      position,
      status,
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
  updates: { position?: number; status?: "published" | "draft" | "deactivated" }
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
