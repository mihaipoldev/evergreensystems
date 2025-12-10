import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Testimonial } from "./types";

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
  
  // Explicitly fetch ALL testimonials without any approval filtering
  // Admin users need to see both approved and unapproved testimonials
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author_name, author_role, company_name, headline, quote, avatar_url, rating, approved, position, created_at, updated_at")
    // No .eq("approved", ...) filter - we want ALL testimonials
    .order("approved", { ascending: false }) // Approved first, then unapproved
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(normalizeTestimonial);
}

/**
 * Get a single testimonial by id
 */
export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author_name, author_role, company_name, headline, quote, avatar_url, rating, approved, position, created_at, updated_at")
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
