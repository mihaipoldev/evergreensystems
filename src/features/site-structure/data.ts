import { createServiceRoleClient } from "@/lib/supabase/server";
import { getSiteStructure, getSiteStructureByPageType, updateSiteStructure } from "@/lib/supabase/queries";
import type { SiteStructure, SiteStructureWithPage } from "./types";
import type { Page } from "@/features/pages/types";

/**
 * Get all pages grouped by type
 * Uses service role client to bypass RLS for admin operations
 */
export async function getPagesByType(): Promise<Record<string, Page[]>> {
  const supabase = createServiceRoleClient();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, title, description, type, status, created_at, updated_at")
    .not("type", "is", null)
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
