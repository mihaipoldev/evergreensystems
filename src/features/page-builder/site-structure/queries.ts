import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { SiteStructure, SiteStructureWithPage } from "./types";
import type { Page } from "@/features/page-builder/pages/types";

/**
 * Get all site structure entries
 * Returns empty array if none found
 */
export async function getSiteStructure(): Promise<Database["public"]["Tables"]["site_structure"]["Row"][]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_structure")
    .select("*")
    .order("page_type", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get site structure entry by page_type
 * Returns null if not found
 */
export async function getSiteStructureByPageType(pageType: string): Promise<Database["public"]["Tables"]["site_structure"]["Row"] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_structure")
    .select("*")
    .eq("page_type", pageType)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get site structure entries by page ID
 * Returns array of entries where the page is used as production or development page
 */
export async function getSiteStructureByPageId(pageId: string): Promise<Array<{ page_type: string; environment: 'production' | 'development' | 'both' }>> {
  const supabase = await createClient();
  
  // Query for entries where the page is used as production page
  const { data: productionData, error: productionError } = await supabase
    .from("site_structure")
    .select("page_type, production_page_id, development_page_id")
    .eq("production_page_id", pageId);

  if (productionError) {
    throw productionError;
  }

  // Query for entries where the page is used as development page
  const { data: developmentData, error: developmentError } = await supabase
    .from("site_structure")
    .select("page_type, production_page_id, development_page_id")
    .eq("development_page_id", pageId);

  if (developmentError) {
    throw developmentError;
  }

  // Combine and deduplicate entries
  type SiteStructureEntry = {
    page_type: string;
    production_page_id: string | null;
    development_page_id: string | null;
  };
  
  const allEntries = new Map<string, SiteStructureEntry>();
  const productionEntries: SiteStructureEntry[] = (productionData || []) as SiteStructureEntry[];
  const developmentEntries: SiteStructureEntry[] = (developmentData || []) as SiteStructureEntry[];
  
  productionEntries.forEach(entry => {
    allEntries.set(entry.page_type, entry);
  });
  
  developmentEntries.forEach(entry => {
    const existing = allEntries.get(entry.page_type);
    if (existing) {
      // Entry already exists, merge the data
      allEntries.set(entry.page_type, {
        ...existing,
        development_page_id: entry.development_page_id,
      });
    } else {
      allEntries.set(entry.page_type, entry);
    }
  });

  if (allEntries.size === 0) {
    return [];
  }

  return Array.from(allEntries.values()).map(entry => {
    const isProduction = entry.production_page_id === pageId;
    const isDevelopment = entry.development_page_id === pageId;
    
    let environment: 'production' | 'development' | 'both';
    if (isProduction && isDevelopment) {
      environment = 'both';
    } else if (isProduction) {
      environment = 'production';
    } else {
      environment = 'development';
    }

    return {
      page_type: entry.page_type,
      environment,
    };
  });
}

/**
 * Update site structure to set production and development page variants for a page type
 * Creates entry if it doesn't exist, updates if it does
 */
export async function updateSiteStructure(
  pageType: string, 
  productionPageId: string | null, 
  developmentPageId: string | null,
  slug: string
): Promise<void> {
  const supabase = await createClient();
  
  // Check if entry exists
  const existing = await getSiteStructureByPageType(pageType);
  
  if (existing) {
    // Update existing entry
    const { error } = await (supabase
      .from("site_structure") as any)
      .update({
        production_page_id: productionPageId,
        development_page_id: developmentPageId,
        slug: slug,
        updated_at: new Date().toISOString(),
      })
      .eq("page_type", pageType);

    if (error) {
      throw error;
    }
  } else {
    // Create new entry
    const { error } = await (supabase
      .from("site_structure") as any)
      .insert({
        page_type: pageType,
        slug: slug,
        production_page_id: productionPageId,
        development_page_id: developmentPageId,
      });

    if (error) {
      throw error;
    }
  }
  
  // Invalidate cache
  const { revalidateTag } = await import("next/cache");
  revalidateTag("site-structure", "max");
  revalidateTag(`page-slug-${slug}`, "max");
}

/**
 * Get all pages grouped by type
 * Uses service role client to bypass RLS for admin operations
 */
export async function getPagesByType(): Promise<Record<string, Page[]>> {
  const supabase = createServiceRoleClient();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, title, description, type, status, order, created_at, updated_at")
    .not("type", "is", null)
    .order("order", { ascending: true })
    .order("created_at", { ascending: false })
    .returns<Page[]>();

  if (error) {
    throw error;
  }

  // Group pages by type
  const pagesByType: Record<string, Page[]> = {};
  (pages || []).forEach((page) => {
    if (page.type) {
      if (!pagesByType[page.type]) {
        pagesByType[page.type] = [];
      }
      pagesByType[page.type].push(page);
    }
  });

  // Sort pages within each type by order
  Object.keys(pagesByType).forEach((type) => {
    pagesByType[type].sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  return pagesByType;
}

/**
 * Get site structure with production and development page information
 */
export async function getSiteStructureWithPages(): Promise<SiteStructureWithPage[]> {
  const supabase = createServiceRoleClient();
  const siteStructure = await getSiteStructure();

  // Fetch production and development pages for each site structure entry
  const siteStructureWithPages: SiteStructureWithPage[] = await Promise.all(
    siteStructure.map(async (entry) => {
      // Fetch production page
      const productionPage = entry.production_page_id
        ? await supabase
            .from("pages")
            .select("id, title")
            .eq("id", entry.production_page_id)
            .maybeSingle()
        : { data: null };

      // Fetch development page
      const developmentPage = entry.development_page_id
        ? await supabase
            .from("pages")
            .select("id, title")
            .eq("id", entry.development_page_id)
            .maybeSingle()
        : { data: null };

      return {
        ...entry,
        production_page: productionPage.data || null,
        development_page: developmentPage.data || null,
      };
    })
  );

  return siteStructureWithPages;
}

/**
 * Update site structure entry
 */
export async function updateSiteStructureEntry(
  pageType: string,
  productionPageId: string | null,
  developmentPageId: string | null,
  slug: string
): Promise<void> {
  await updateSiteStructure(pageType, productionPageId, developmentPageId, slug);
}
