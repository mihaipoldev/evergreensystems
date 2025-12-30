import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { FAQItem } from "./types";
import { unstable_cache } from "next/cache";
import { shouldIncludeItemByStatus } from "@/lib/supabase/queries";

/**
 * Get all FAQ items (admin) - uses service role client to bypass RLS
 * Ordered by position
 */
export async function getAllFAQItems(): Promise<FAQItem[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get all FAQ items (public) - uses regular client with RLS
 * Returns limited fields, cached for performance
 */
export async function getAllFAQItemsPublic() {
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
 * Get a single FAQ item by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getFAQItemById(id: string): Promise<FAQItem | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("faq_items")
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
        status: item.status || "published",
        created_at: item.created_at,
      },
    }));
}
