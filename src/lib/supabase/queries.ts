import { createClient } from "./server";
import type { Database } from "./types";
import type { CTAButtonWithSection } from "@/features/cta/types";
import { unstable_cache } from "next/cache";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Helper function to determine if an item should be included based on status and environment
 * - Development: shows "published" and "draft" items
 * - Production: shows only "published" items
 * - "deactivated": never shown in any environment
 * - null/undefined: included for backward compatibility
 */
export function shouldIncludeItemByStatus(
  status: string | null | undefined,
  isDevelopment: boolean
): boolean {
  if (!status) return true; // Backward compatibility - treat null/undefined as published
  
  const normalizedStatus = String(status).trim().toLowerCase();
  
  // Always exclude deactivated
  if (normalizedStatus === "deactivated") return false;
  
  // In development: show published and draft
  if (isDevelopment) {
    return normalizedStatus === "published" || normalizedStatus === "draft";
  }
  
  // In production: only show published
  return normalizedStatus === "published";
}

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

/**
 * Get the first page ID that contains a section
 * Returns null if section is not found in any page
 */
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

/**
 * Reorder items in a table by updating their positions
 * @param table - Table name
 * @param items - Array of { id, position } objects
 */
export async function reorderItems(
  table: "page_sections" | "cta_buttons" | "offer_features" | "testimonials" | "faq_items" | "timeline" | "results",
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
 * In production: only published sections
 * In development: published and draft sections
 * Cached for 5 minutes to improve performance
 */
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

/**
 * Get all published testimonials (public-facing)
 * In production: only published testimonials
 * In development: published and draft testimonials
 * Cached for 5 minutes to improve performance
 */
export async function getApprovedTestimonials() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      let query = supabase
        .from("testimonials")
        .select("id, author_name, author_role, company_name, headline, quote, avatar_url, rating, status, position, created_at, updated_at");
      
      if (isDevelopment) {
        query = query.in("status", ["published", "draft"]);
      } else {
        query = query.eq("status", "published");
      }
      
      const { data, error } = await query.order("position", { ascending: true });

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
 * Get all FAQ items (public-facing)
 * Status is now managed at the junction table level, so we return all items
 * Cached for 5 minutes to improve performance
 */
export async function getAllFAQItems() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from("faq_items")
        .select("id, question, answer, position, created_at, updated_at")
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
 * Get all features (public-facing)
 * Status is now managed at the junction table level, so we return all features
 * Cached for 5 minutes to improve performance
 */
export async function getActiveOfferFeatures() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from("offer_features")
        .select("id, title, subtitle, description, icon, position, created_at, updated_at")
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
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

/**
 * Get all features for a specific section via section_features junction table
 */
export async function getFeaturesBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const { data, error } = await supabase
    .from("section_features")
    .select(`
      *,
      offer_features (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.offer_features) return false;
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.offer_features,
      section_feature: {
        id: item.id,
        position: item.position,
        status: (item.status || "published") as "published" | "draft" | "deactivated",
        created_at: item.created_at,
      },
    }));
}

/**
 * Get all testimonials for a specific section via section_testimonials junction table
 */
export async function getTestimonialsBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Query junction table first
  const { data: sectionTestimonialsData, error: junctionError } = await supabase
    .from("section_testimonials")
    .select("*")
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (junctionError) {
    throw junctionError;
  }

  // Get all testimonial IDs from junction table
  const testimonialIds = sectionTestimonialsData?.map((item: any) => item.testimonial_id).filter(Boolean) || [];
  
  // Query testimonials separately
  const { data: testimonialsData, error: testimonialsError } = await supabase
    .from("testimonials")
    .select("*")
    .in("id", testimonialIds);

  if (testimonialsError) {
    throw testimonialsError;
  }

  // Create a map for quick lookup
  const testimonialsMap = new Map((testimonialsData || []).map((t: any) => [t.id, t]));

  return (sectionTestimonialsData || [])
    .filter((item: any) => {
      const testimonial = testimonialsMap.get(item.testimonial_id);
      if (!testimonial) return false;

      // Filter based on status from junction table
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => {
      const testimonial = testimonialsMap.get(item.testimonial_id);
      if (!testimonial) return null;
      
      return {
        ...testimonial,
        section_testimonial: {
          id: item.id,
          position: item.position,
          status: (item.status || "published") as "published" | "draft" | "deactivated",
          created_at: item.created_at,
        },
      };
    })
    .filter((t): t is any => t !== null);
}

/**
 * Get all FAQ items for a specific section via section_faq_items junction table
 */
export async function getFAQItemsBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const { data, error } = await supabase
    .from("section_faq_items")
    .select(`
      *,
      faq_items (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.faq_items) return false;
      
      // Filter based on status from junction table
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.faq_items,
      section_faq_item: {
        id: item.id,
        position: item.position,
        status: item.status || "draft",
        created_at: item.created_at,
      },
    }));
}

/**
 * Get all timeline items for a specific section via section_timeline junction table
 */
export async function getTimelineBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const { data, error } = await supabase
    .from("section_timeline")
    .select(`
      *,
      timeline (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.timeline) return false;
      
      // Filter based on status from junction table
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.timeline,
      section_timeline: {
        id: item.id,
        position: item.position,
        status: item.status || "published",
        created_at: item.created_at,
      },
    }));
}

/**
 * Get all results for a specific section via section_results junction table
 */
export async function getResultsBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const { data, error } = await supabase
    .from("section_results")
    .select(`
      *,
      results (*)
    `)
    .eq("section_id", sectionId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.results) return false;
      
      // Filter based on status from junction table
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.results,
      section_result: {
        id: item.id,
        position: item.position,
        status: item.status || "published",
        created_at: item.created_at,
      },
    }));
}

/**
 * Get all CTA buttons for a specific section via section_cta_buttons junction table
 */
export async function getCTAButtonsBySectionId(sectionId: string): Promise<CTAButtonWithSection[]> {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
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

  return (data || [])
    .filter((item: any) => {
      if (!item.cta_buttons || !item.cta_buttons.id) return false;
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.cta_buttons,
      section_cta_button: {
        id: item.id,
        position: item.position,
        status: (item.status || "published") as "published" | "draft" | "deactivated",
        created_at: item.created_at,
      },
    }));
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

/**
 * Get all social platforms for a specific section via section_socials junction table
 */
export async function getSocialPlatformsBySectionId(sectionId: string) {
  const supabase = await createClient();
  const isDevelopment = process.env.NODE_ENV === 'development';

  const { data, error } = await supabase
    .from("section_socials")
    .select(`
      *,
      social_platforms (*)
    `)
    .eq("section_id", sectionId)
    .order("order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .filter((item: any) => {
      if (!item.social_platforms) return false;
      return shouldIncludeItemByStatus(item.status, isDevelopment);
    })
    .map((item: any) => ({
      ...item.social_platforms,
      section_social: {
        id: item.id,
        order: item.order,
        status: (item.status || "published") as "published" | "draft" | "deactivated",
        created_at: item.created_at,
      },
    }));
}
