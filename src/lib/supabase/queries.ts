import { createClient } from "./server";
import type { Database } from "./types";

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
