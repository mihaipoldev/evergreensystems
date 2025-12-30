"use client";

import { useState, useEffect } from "react";
import { SiteStructurePageClient } from "@/features/page-builder/site-structure/components/SiteStructurePageClient";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";
import type { Page } from "@/features/page-builder/pages/types";
import type { SiteStructureWithPage } from "@/features/page-builder/site-structure/types";

export function SiteStructureContent() {
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
        
        // Fetch from single optimized endpoint
        const response = await fetch("/api/admin/site-structure/data");
        
        if (!response.ok) {
          throw new Error("Failed to fetch site structure data");
        }
        
        const data = await response.json();
        
        // Data is already grouped by type from the API
        setPagesByType(data.pagesByType || {});
        setSiteStructure(data.siteStructure || []);
        
        // Flatten pagesByType to create allPages array for PagesList
        const flattenedPages: Page[] = [];
        Object.values(data.pagesByType || {}).forEach((pages: any) => {
          flattenedPages.push(...pages);
        });
        setAllPages(flattenedPages);
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

