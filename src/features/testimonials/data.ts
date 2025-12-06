import { createClient } from "@/lib/supabase/server";
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
 * RLS policies ensure authenticated users see all testimonials
 * Note: Middleware protects admin routes, so users accessing this are authenticated
 * 
 * @deprecated Use the API route /api/admin/testimonials instead for better auth handling
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("approved", { ascending: false })
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

  return data ? normalizeTestimonial(data) : null;
}
