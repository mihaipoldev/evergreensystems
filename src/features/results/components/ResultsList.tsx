"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Result } from "../types";

type ResultsListProps = {
  initialResults: Result[];
  hideHeader?: boolean;
  sectionId?: string;
  pageId?: string;
};

export function ResultsList({ initialResults, hideHeader = false, sectionId, pageId }: ResultsListProps) {
  const [results, setResults] = useState<Result[]>(initialResults);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/results/${id}`, {
        method: "DELETE",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete result");
      }

      toast.success("Result deleted successfully");
      setResults((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Error deleting result:", error);
      toast.error(error.message || "Failed to delete result");
      throw error;
    }
  }, []);

  const handleReorder = useCallback(async (orderedItems: Result[]) => {
    if (searchQuery.trim()) {
      toast.info("Clear the search to reorder results.");
      return;
    }

    setIsSavingOrder(true);
    const newOrder = orderedItems.map((item, index) => ({ ...item, position: index }));

    let previousItems: Result[] = [];
    setResults((prev) => {
      previousItems = prev;
      return newOrder;
    });

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/results/reorder", {
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
        throw new Error(error.error || "Failed to reorder results");
      }

      toast.success("Result order updated");
    } catch (error: any) {
      console.error("Error reordering results:", error);
      toast.error(error.message || "Failed to reorder results");
      setResults(previousItems);
    } finally {
      setIsSavingOrder(false);
    }
  }, [searchQuery]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const query = searchQuery.toLowerCase();
      const contentStr = JSON.stringify(item.content).toLowerCase();
      return contentStr.includes(query);
    });
  }, [results, searchQuery]);

  const renderContent = useCallback((item: Result) => {
    const editHref = pageId && sectionId 
      ? `/admin/results/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=results`
      : `/admin/results/${item.id}/edit`;
    return (
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 bg-muted">
          <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 !text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={editHref}
            className="text-base font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer block mb-1"
          >
            Result Item
          </Link>
          <div className="text-sm text-muted-foreground">
            <pre className="line-clamp-2 whitespace-pre-wrap font-sans">
              {JSON.stringify(item.content, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }, [pageId, sectionId]);

  const renderActions = useCallback((item: Result) => {
    const editHref = pageId && sectionId 
      ? `/admin/results/${item.id}/edit?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=results`
      : `/admin/results/${item.id}/edit`;
    return (
      <ActionMenu
        itemId={item.id}
        editHref={editHref}
        onDelete={handleDelete}
        deleteLabel="this result"
      />
    );
  }, [pageId, sectionId, handleDelete]);

  return (
    <div className="w-full">
      {!hideHeader && (
        <div className="mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-foreground leading-none">Results</h1>
              <span className="inline-flex items-center justify-center h-5 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 leading-none">
                ({filteredResults.length} {filteredResults.length === 1 ? "result" : "results"})
              </span>
            </div>
            <p className="text-base text-muted-foreground">
              Manage result items and metrics.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        <AdminToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search results..."
        >
          <Button
            asChild
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
            title="Add Result"
          >
            <Link href={pageId && sectionId ? `/admin/results/new?returnTo=/admin/pages/${pageId}/sections/${sectionId}?tab=results` : "/admin/results/new"}>
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
            </Link>
          </Button>
        </AdminToolbar>

        {isSavingOrder && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Saving order...
          </div>
        )}

        {filteredResults.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            {searchQuery
              ? "No results found matching your search"
              : "No results found"}
          </div>
        ) : (
          <div className="space-y-2">
            <SortableCardList
              items={filteredResults}
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
