"use client";

import { Suspense, useState, useEffect } from "react";
import { SiteStructurePageClient } from "@/features/page-builder/site-structure/components/SiteStructurePageClient";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";
import type { Page } from "@/features/page-builder/pages/types";
import type { SiteStructureWithPage } from "@/features/page-builder/site-structure/types";

export default function SiteStructurePage() {
  const [pagesByType, setPagesByType] = useState<Record<string, Page[]>>({});
  const [siteStructure, setSiteStructure] = useState<SiteStructureWithPage[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [pagesResponse, siteStructureResponse] = await Promise.all([
          fetch("/api/admin/pages"),
          fetch("/api/admin/site-structure"),
        ]);
        
        if (!pagesResponse.ok) {
          throw new Error("Failed to fetch pages");
        }
        
        if (!siteStructureResponse.ok) {
          throw new Error("Failed to fetch site structure");
        }
        
        const pagesData = await pagesResponse.json();
        const siteStructureData = await siteStructureResponse.json();
        
        // Group pages by type
        const pagesByTypeMap: Record<string, Page[]> = {};
        (pagesData || []).forEach((page: Page) => {
          if (page.type) {
            if (!pagesByTypeMap[page.type]) {
              pagesByTypeMap[page.type] = [];
            }
            pagesByTypeMap[page.type].push(page);
          }
        });
        
        // Sort pages within each type by order
        Object.keys(pagesByTypeMap).forEach((type) => {
          pagesByTypeMap[type].sort((a, b) => {
            if (a.order !== b.order) {
              return a.order - b.order;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        });
        
        setPagesByType(pagesByTypeMap);
        setSiteStructure(siteStructureData || []);
        setAllPages(pagesData || []);
      } catch (err) {
        console.error("Error fetching site structure data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageSkeleton
        title="Site Structure"
        description="Manage your site structure and page assignments."
        variant="default"
      />
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <PageSkeleton
          title="Site Structure"
          description="Manage your site structure and page assignments."
          variant="default"
        />
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <SiteStructurePageClient 
      pagesByType={pagesByType} 
      siteStructure={siteStructure} 
      allPages={allPages}
    />
  );
}
