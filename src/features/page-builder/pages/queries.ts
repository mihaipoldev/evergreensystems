import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Page } from "./types";
import { unstable_cache } from "next/cache";

/**
 * Get all pages, ordered by creation date
 * Uses service role client to bypass RLS for admin operations
 */
export async function getAllPages(): Promise<Page[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("pages")
    .select("id, title, description, type, status, order, created_at, updated_at")
    .order("order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single page by id
 * Uses service role client to bypass RLS for admin operations
 */
export async function getPageById(id: string): Promise<Page | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("pages")
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
 * Get a page by its slug
 * Returns null if page is not found (instead of throwing)
 * Cached for 5 minutes to improve performance
 * NOTE: This is kept for backward compatibility. Use getActivePageBySlug for variant support.
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
 * Get the active page variant by slug from site_structure
 * Returns null if not found
 * Cached for 1 minute to improve performance
 * Automatically selects production or development page based on NODE_ENV
 */
export async function getActivePageBySlug(slug: string): Promise<Database["public"]["Tables"]["pages"]["Row"] | null> {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // First, get the site_structure entry for this slug
      const { data: siteStructure, error: siteError } = await supabase
        .from("site_structure")
        .select("production_page_id, development_page_id")
        .eq("slug", slug)
        .maybeSingle<{ production_page_id: string | null; development_page_id: string | null }>();

      if (siteError) {
        throw siteError;
      }

      if (!siteStructure) {
        return null;
      }

      // Select page ID based on environment
      // Fallback to production if development_page_id is null
      const pageId = isDevelopment 
        ? (siteStructure.development_page_id || siteStructure.production_page_id)
        : siteStructure.production_page_id;

      if (!pageId) {
        return null;
      }

      // Then fetch the page by ID
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .maybeSingle();

      if (pageError) {
        throw pageError;
      }

      return page;
    },
    [`active-page-by-slug-${slug}-${process.env.NODE_ENV}`],
    {
      revalidate: 60, // 1 minute
      tags: ['site-structure', `page-slug-${slug}`],
    }
  )();
}
