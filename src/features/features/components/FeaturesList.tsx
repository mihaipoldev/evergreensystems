"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBullseye } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { RichText } from "@/components/ui/RichText";
import { formatRichText } from "@/lib/formatRichText";
import type { OfferFeature } from "../types";

type FeaturesListProps = {
  initialFeatures: OfferFeature[];
  hideHeader?: boolean;
  sectionId?: string;
  pageId?: string;
};

export function FeaturesList({ initialFeatures, hideHeader = false, sectionId, pageId }: FeaturesListProps) {
  const [features, setFeatures] = useState<OfferFeature[]>(initialFeatures);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/offer-features/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete feature");
      }

      toast.success("Feature deleted successfully");
      setFeatures((prev) => prev.filter((f) => f.id !== id));
    } catch (error: any) {
      console.error("Error deleting feature:", error);
      toast.error(error.message || "Failed to delete feature");
      throw error;
    }
  }, []);


  const handleReorder = useCallback(async (orderedItems: OfferFeature[]) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder features.");
      return;
    }

    setIsSavingOrder(true);
    const newOrder = orderedItems.map((item, index) => ({ ...item, position: index }));

    // Store current state before updating using functional update
    let previousItems: OfferFeature[] = [];
    setFeatures((prev) => {
      previousItems = prev;
      return newOrder;
    });

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/offer-features/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map(({ id, position }) => ({ id, position })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder features");
      }

      toast.success("Feature order updated");
    } catch (error: any) {
      console.error("Error reordering features:", error);
      toast.error(error.message || "Failed to reorder features");
      setFeatures(previousItems);
    } finally {
      setIsSavingOrder(false);
    }
  }, [searchQuery]);

  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      const query = searchQuery.toLowerCase();
      return (
        feature.title.toLowerCase().includes(query) ||
        feature.subtitle?.toLowerCase().includes(query) ||
        feature.description?.toLowerCase().includes(query)
      );
    });
  }, [features, searchQuery]);

  const renderContent = useCallback((item: OfferFeature) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full overflow-hidden hidden md:flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
          <FontAwesomeIconFromClass
            iconClass={item.icon}
            fallbackIcon={faBullseye}
            className="h-6 w-6 !text-primary"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <Link
              href={pageId && sectionId 
                ? `/admin/features/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=features`
                : `/admin/features/${item.id}/edit`}
              className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
            >
              {item.title}
            </Link>
          </div>
          {item.subtitle && (
            <RichText
              text={item.subtitle}
              as="p"
              className="text-sm text-muted-foreground mb-1 leading-relaxed"
            />
          )}
          {item.description && (
            <RichText
              text={item.description}
              as="div"
              className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3"
            />
          )}
        </div>
      </div>
    </div>
  ), [pageId, sectionId]);

  const renderActions = useCallback((item: OfferFeature) => {
    const editHref = pageId && sectionId 
      ? `/admin/pages/${pageId}/sections/${sectionId}/items/${item.id}/edit`
      : `/admin/features/${item.id}/edit`;
    return (
      <ActionMenu
        itemId={item.id}
        editHref={editHref}
        onDelete={handleDelete}
        deleteLabel={`feature "${item.title}"`}
      />
    );
  }, [pageId, sectionId, handleDelete]);

  return (
    <div className="w-full">
      {!hideHeader && (
          <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">Features</h1>
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
                ({filteredFeatures.length} {filteredFeatures.length === 1 ? "feature" : "features"})
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Manage your site features, including titles, descriptions, and icons.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search features..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Feature"
          >
            <Link href={pageId && sectionId ? `/admin/features/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=features` : "/admin/features/new"}>
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

            {filteredFeatures.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
                  {searchQuery
                    ? "No features found matching your search"
                    : "No features found"}
          </div>
            ) : (
          <div className="space-y-2">
            <SortableCardList
              items={filteredFeatures}
              onReorder={handleReorder}
              renderContent={renderContent}
              renderActions={renderActions}
            />
            {isSavingOrder && (
              <p className="text-xs text-muted-foreground px-1">Saving order...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
