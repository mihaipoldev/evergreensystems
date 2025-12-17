"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faFile } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { usePages, useDeletePage, useDuplicatePage } from "@/lib/react-query/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { Page } from "../types";

type PagesListProps = {
  initialPages: Page[];
};

export function PagesList({ initialPages }: PagesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  // Use React Query hook with server-side search
  const { data: pages = initialPages, isLoading, error } = usePages(
    debouncedSearch || undefined,
    { initialData: initialPages }
  );
  const deletePage = useDeletePage();
  const duplicatePage = useDuplicatePage();

  const handleDuplicate = async (id: string) => {
    try {
      await duplicatePage.mutateAsync(id);
      toast.success("Page duplicated successfully");
      // Stay on the current page - no redirect
    } catch (error: any) {
      console.error("Error duplicating page:", error);
      toast.error(error.message || "Failed to duplicate page");
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePage.mutateAsync(id);
      toast.success("Page deleted successfully");
    } catch (error: any) {
      console.error("Error deleting page:", error);
      toast.error(error.message || "Failed to delete page");
      throw error;
    }
  };

  const handleReorder = useCallback(async (orderedItems: Array<Page & { position?: number }>) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder pages.");
      return;
    }

    const toastId = toast.loading("Saving order...");

    try {
      const response = await fetch("/api/admin/pages/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderedItems.map((item, index) => ({
            id: item.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder pages");
      }

      toast.success("Pages reordered successfully", { id: toastId });
      
      // Invalidate and refetch pages to show updated order
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    } catch (error: any) {
      console.error("Error reordering pages:", error);
      toast.error(error.message || "Failed to reorder pages", { id: toastId });
    }
  }, [searchQuery, queryClient]);

  return (
    <div className="w-full">
        <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground leading-none">Pages</h1>
            <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
              ({pages.length} {pages.length === 1 ? "page" : "pages"})
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Manage your site pages, including their content and structure.
          </p>
        </div>
      </div>
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search pages..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="New Page"
          >
            <Link href="/admin/pages/new">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {isLoading && !pages.length ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            Loading pages...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            Error loading pages. Please try again.
          </div>
        ) : pages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No pages found matching your search"
              : "No pages found"}
          </div>
        ) : (
          <div className="space-y-2">
            <SortableCardList
              items={pages.map((page) => ({ ...page, position: page.order }))}
              onReorder={handleReorder}
              renderContent={(page) => (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
                    <FontAwesomeIcon
                      icon={faFile}
                      className="h-6 w-6 text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
                    >
                      {page.title}
                    </Link>
                  </div>
                </div>
              )}
              renderActions={(page) => (
                <ActionMenu
                  itemId={page.id}
                  editHref={`/admin/pages/${page.id}/edit`}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  deleteLabel={`page "${page.title}"`}
                />
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
