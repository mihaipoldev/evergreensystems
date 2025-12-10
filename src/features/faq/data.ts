import { createServiceRoleClient } from "@/lib/supabase/server";
import type { FAQItem } from "./types";

/**
 * Get all FAQ items, ordered by position
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllFAQItems(options?: { status?: "active" | "inactive" }): Promise<FAQItem[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("faq_items")
    .select("*")
    .order("position", { ascending: true });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
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
