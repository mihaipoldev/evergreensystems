import { createClient } from "@/lib/supabase/server";
import type { FAQItem } from "./types";

/**
 * Get all FAQ items, ordered by position
 */
export async function getAllFAQItems(): Promise<FAQItem[]> {
  const supabase = await createClient();
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
 * Get a single FAQ item by id
 */
export async function getFAQItemById(id: string): Promise<FAQItem | null> {
  const supabase = await createClient();
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
