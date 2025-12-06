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
 * Get all testimonials, ordered by position
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
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
