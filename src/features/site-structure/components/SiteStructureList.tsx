"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CardList } from "@/components/admin/CardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap, faEdit } from "@fortawesome/free-solid-svg-icons";
import type { Page } from "@/features/pages/types";
import type { SiteStructureWithPage } from "../types";

type SiteStructureListProps = {
  pagesByType: Record<string, Page[]>;
  siteStructure: SiteStructureWithPage[];
  onSaveButtonStateChange?: (state: {
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => Promise<void>;
  }) => void;
};

export function SiteStructureList({ pagesByType, siteStructure, onSaveButtonStateChange }: SiteStructureListProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { production: string | null; development: string | null }>>(() => {
    const initial: Record<string, { production: string | null; development: string | null }> = {};
    siteStructure.forEach((entry) => {
      initial[entry.page_type] = {
        production: entry.production_page_id || null,
        development: entry.development_page_id || null,
      };
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Get all page types
  const pageTypes = Object.keys(pagesByType);

  const handleVariantChange = (pageType: string, environment: 'production' | 'development', pageId: string | null) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [pageType]: {
        ...prev[pageType],
        [environment]: pageId,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(selectedVariants).map(async ([pageType, variants]) => {
        // Get or generate slug from page type (lowercase, replace spaces with hyphens)
        const slug = pageType.toLowerCase().replace(/\s+/g, "-");

        const response = await fetch("/api/admin/site-structure", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_type: pageType,
            production_page_id: variants.production || null,
            development_page_id: variants.development || null,
            slug: slug,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update site structure");
        }
      });

      await Promise.all(updates);
      toast.success("Site structure updated successfully");
      window.location.reload(); // Refresh to show updated data
    } catch (error: any) {
      console.error("Error saving site structure:", error);
      toast.error(error.message || "Failed to update site structure");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    return siteStructure.some((entry) => {
      const selected = selectedVariants[entry.page_type];
      if (!selected) return false;
      return (
        selected.production !== entry.production_page_id ||
        selected.development !== entry.development_page_id
      );
    }) || Object.keys(selectedVariants).some((type) => {
      const existing = siteStructure.find((e) => e.page_type === type);
      const selected = selectedVariants[type];
      return !existing && (selected.production || selected.development);
    });
  };

  // Notify parent of state changes for header button
  useEffect(() => {
    if (onSaveButtonStateChange) {
      onSaveButtonStateChange({
        hasChanges: hasChanges(),
        isSaving,
        onSave: handleSave,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariants, isSaving, onSaveButtonStateChange]);

  if (pageTypes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
        <p>No page types found. Create pages with types to manage site structure.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <CardList
        items={pageTypes.map((type) => ({ id: type }))}
        renderContent={(item) => {
          const pageType = item.id;
          const pages = pagesByType[pageType] || [];
          const currentEntry = siteStructure.find((e) => e.page_type === pageType);
          const selected = selectedVariants[pageType] || {
            production: currentEntry?.production_page_id || null,
            development: currentEntry?.development_page_id || null,
          };
          
          const productionPage = selected.production ? pages.find((p) => p.id === selected.production) : null;
          const developmentPage = selected.development ? pages.find((p) => p.id === selected.development) : null;

          return (
            <div className="flex items-start gap-4 w-full">
              <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
                <FontAwesomeIcon icon={faSitemap} className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-base font-semibold text-foreground">{pageType}</h3>
                  {currentEntry && (
                    <span className="text-xs text-muted-foreground">
                      (Slug: {currentEntry.slug})
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {/* Production Select */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Production</Label>
                    <Select
                      value={selected.production || undefined}
                      onValueChange={(value) => handleVariantChange(pageType, 'production', value === "__none__" ? null : value)}
                    >
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select production page">
                          {productionPage
                            ? productionPage.title
                            : "Select page"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Development Select */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Development</Label>
                    <Select
                      value={selected.development || undefined}
                      onValueChange={(value) => handleVariantChange(pageType, 'development', value === "__none__" ? null : value)}
                    >
                      <SelectTrigger className="w-full max-w-md">
                        <SelectValue placeholder="Select development page">
                          {developmentPage
                            ? developmentPage.title
                            : "Select page"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
