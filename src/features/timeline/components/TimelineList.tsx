"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faListOl } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useDuplicateTimelineItem } from "@/lib/react-query/hooks/useTimeline";
import type { Timeline } from "../types";

type TimelineListProps = {
  initialTimelineItems: Timeline[];
  hideHeader?: boolean;
  sectionId?: string;
  pageId?: string;
};

export function TimelineList({ initialTimelineItems, hideHeader = false, sectionId, pageId }: TimelineListProps) {
  const [timelineItems, setTimelineItems] = useState<Timeline[]>(initialTimelineItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const duplicateTimelineItem = useDuplicateTimelineItem();

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      await duplicateTimelineItem.mutateAsync({ id, sectionId });
      toast.success("Timeline item duplicated successfully");
      // Refresh the list
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/timeline`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const updated = await response.json();
        setTimelineItems(updated);
      }
    } catch (error: any) {
      console.error("Error duplicating timeline item:", error);
      toast.error(error.message || "Failed to duplicate timeline item");
      throw error;
    }
  }, [sectionId, duplicateTimelineItem]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete timeline item");
      }

      toast.success("Timeline item deleted successfully");
      setTimelineItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting timeline item:", error);
      toast.error(error.message || "Failed to delete timeline item");
      throw error;
    }
  }, []);

  const handleReorder = useCallback(async (orderedItems: Timeline[]) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder timeline items.");
      return;
    }

    setIsSavingOrder(true);
    const newOrder = orderedItems.map((item, index) => ({ ...item, position: index }));

    let previousItems: Timeline[] = [];
    setTimelineItems((prev) => {
      previousItems = prev;
      return newOrder;
    });

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/timeline/reorder", {
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
        throw new Error(error.error || "Failed to reorder timeline items");
      }

      toast.success("Timeline order updated");
    } catch (error: any) {
      console.error("Error reordering timeline items:", error);
      toast.error(error.message || "Failed to reorder timeline items");
      setTimelineItems(previousItems);
    } finally {
      setIsSavingOrder(false);
    }
  }, [searchQuery]);

  const filteredTimelineItems = useMemo(() => {
    return timelineItems.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.badge?.toLowerCase().includes(query)
      );
    });
  }, [timelineItems, searchQuery]);

  const renderContent = useCallback((item: Timeline) => {
    const editHref = pageId && sectionId 
      ? `/admin/timeline/${item.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=timeline`
      : `/admin/timeline/${item.id}/edit`;
    return (
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
          <FontAwesomeIconFromClass
            iconClass={item.icon}
            fallbackIcon={faListOl}
            className="h-6 w-6 !text-primary"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            {item.badge && (
              <Badge className="text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          <Link
            href={editHref}
            className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer block mb-1"
          >
            {item.title}
          </Link>
          {item.subtitle && (
            <p className="text-sm text-muted-foreground">
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }, [pageId, sectionId]);

  const renderActions = useCallback((item: Timeline) => {
    const editHref = pageId && sectionId 
      ? `/admin/timeline/${item.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=timeline`
      : `/admin/timeline/${item.id}/edit`;
    return (
      <ActionMenu
        itemId={item.id}
        editHref={editHref}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        deleteLabel={`timeline item "${item.title}"`}
      />
    );
  }, [pageId, sectionId, handleDelete, handleDuplicate]);

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">Timeline Items</h1>
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
                ({filteredTimelineItems.length} {filteredTimelineItems.length === 1 ? "item" : "items"})
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Manage timeline steps and milestones.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search timeline items..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="Add Timeline Item"
          >
            <Link href={pageId && sectionId ? `/admin/timeline/new?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=timeline` : "/admin/timeline/new"}>
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {isSavingOrder && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Saving order...
          </div>
        )}

        {filteredTimelineItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No timeline items found matching your search"
              : "No timeline items found"}
          </div>
        ) : (
          <div className="space-y-2">
            <SortableCardList
              items={filteredTimelineItems}
              onReorder={handleReorder}
              renderContent={renderContent}
              renderActions={renderActions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
