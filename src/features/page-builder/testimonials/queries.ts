import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Testimonial } from "./types";
import { unstable_cache } from "next/cache";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";

/**
 * Normalize avatar URL to ensure it has a protocol
 * Returns null for empty strings, null, or undefined
 */
function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // If it looks like a CDN URL (contains .b-cdn.net or similar), add https://
  if (url.includes("b-cdn.net") || url.includes("cdn")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Normalize testimonial data to ensure avatar URLs have protocols
 */
function normalizeTestimonial(testimonial: Testimonial): Testimonial {
  return {
    ...testimonial,
    avatar_url: normalizeAvatarUrl(testimonial.avatar_url),
  };
}

/**
 * Get all testimonials (both approved and unapproved), ordered by position
 * This is used in the admin panel to show all testimonials regardless of approval status
 * 
 * IMPORTANT: This function uses the service role client to bypass RLS policies
 * and ensure admin users can see ALL testimonials (both approved and unapproved).
 * 
 * @deprecated Use the API route /api/admin/testimonials instead for better auth handling
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  // Use service role client to bypass RLS and ensure we get ALL testimonials
  // This is necessary for admin operations where we need to see unapproved testimonials
  const supabase = createServiceRoleClient();
  
  // Explicitly fetch ALL testimonials
  // Admin users need to see all testimonials
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author_name, author_role, company_name, headline, quote, avatar_url, rating, position, created_at, updated_at")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(normalizeTestimonial);
}

/**
 * Get a single testimonial by id
 * Uses service role client to bypass RLS and ensure admin users can access all testimonials
 */
export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author_name, author_role, company_name, headline, quote, avatar_url, rating, position, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw error;
  }

  return data ? normalizeTestimonial(data) : null;
}

/**
 * Get all approved testimonials (public-facing)
 * Returns only testimonials with status "published" (or "draft" in development)
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
      return {
        ...testimonial,
        section_testimonial: {
          id: item.id,
          position: item.position,
          status: item.status || "published",
          created_at: item.created_at,
        },
      };
    });
}
