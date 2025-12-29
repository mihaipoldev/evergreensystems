"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { SortableCardList } from "@/components/admin/SortableCardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck, faX, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Result, ResultWithSection } from "@/features/page-builder/results/types";

type SectionResultsTabProps = {
  sectionId: string;
  pageId?: string;
  initialResults: ResultWithSection[];
};

export function SectionResultsTab({ sectionId, pageId, initialResults }: SectionResultsTabProps) {
  const [sectionResults, setSectionResults] = useState<ResultWithSection[]>(initialResults);
  const [allResults, setAllResults] = useState<Result[]>([]);

  useEffect(() => {
    loadSectionResults();
    loadAllResults();
  }, [sectionId]);

  const loadSectionResults = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/results`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const results = await response.json();
        setSectionResults(results);
      }
    } catch (error) {
      console.error("Error loading section results:", error);
    }
  };

  const loadAllResults = async () => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch("/api/admin/results", {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.ok) {
        const results = await response.json();
        setAllResults(results || []);
      }
    } catch (error) {
      console.error("Error loading all results:", error);
    }
  };

  const handleAddResult = async (resultId: string) => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const maxPosition = sectionResults.length > 0 
        ? Math.max(...sectionResults.map((item) => item.section_result.position))
        : -1;

      const response = await fetch(`/api/admin/sections/${sectionId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          result_id: resultId,
          position: maxPosition + 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add result");
      }

      toast.success("Result added successfully");
      await loadSectionResults();
    } catch (error: any) {
      console.error("Error adding result:", error);
      toast.error(error.message || "Failed to add result");
    }
  };

  const handleRemoveResult = async (resultId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const resultItem = sectionResults.find((item) => item.id === resultId);
      if (!resultItem) return;

      const response = await fetch(
        `/api/admin/sections/${sectionId}/results?section_result_id=${resultItem.section_result.id}`,
        {
          method: "DELETE",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove result");
      }

      setSectionResults(sectionResults.filter((item) => item.id !== resultId));
      toast.success("Result removed successfully");
    } catch (error: any) {
      console.error("Error removing result:", error);
      toast.error(error.message || "Failed to remove result");
      throw error;
    }
  };

  const handleReorder = useCallback(async (orderedItems: ResultWithSection[]) => {
    const newOrder = orderedItems.map((item, index) => ({ ...item, section_result: { ...item.section_result, position: index } }));

    let previousItems: ResultWithSection[] = [];
    setSectionResults((prev) => {
      previousItems = prev;
      return newOrder;
    });

    const toastId = toast.loading("Saving order...");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const response = await fetch(`/api/admin/sections/${sectionId}/results/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({
            section_result_id: item.section_result.id,
            position: index,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder results");
      }

      toast.success("Results reordered successfully", { id: toastId });
    } catch (error: any) {
      console.error("Error reordering results:", error);
      toast.error(error.message || "Failed to reorder results", { id: toastId });
      setSectionResults(previousItems);
    }
  }, [sectionId]);

  const renderContent = useCallback((item: ResultWithSection) => (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-primary/10">
        <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <pre className="text-xs font-mono line-clamp-2 whitespace-pre-wrap font-sans">
          {JSON.stringify(item.content, null, 2)}
        </pre>
      </div>
    </div>
  ), []);

  const renderActions = useCallback((item: ResultWithSection) => (
    <ActionMenu
      itemId={item.id}
      editHref={`/admin/results/${item.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=results`}
      onDelete={async () => {
        await handleRemoveResult(item.id);
      }}
      deleteLabel="this result from the section"
      customActions={[
        {
          label: "Deselect",
          icon: <FontAwesomeIcon icon={faX} className="h-4 w-4" />,
          onClick: async () => {
            await handleRemoveResult(item.id);
          },
        },
      ]}
    />
  ), []);

  const selectedResultIds = sectionResults.map((item) => item.id);
  const unselectedResults = allResults.filter((item) => !selectedResultIds.includes(item.id));

  return (
    <div className="w-full space-y-4">
      <AdminToolbar>
        <Button
          asChild
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 bg-transparent text-muted-foreground hover:text-primary hover:bg-transparent border-0 shadow-none transition-colors"
          title="Add Result"
        >
          <Link href={`/admin/results/new?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=results`}>
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          </Link>
        </Button>
      </AdminToolbar>

      {/* Selected Results */}
      {sectionResults.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Connected Results</h3>
          <SortableCardList
            items={sectionResults}
            onReorder={handleReorder}
            renderContent={renderContent}
            renderActions={renderActions}
          />
        </div>
      )}

      {/* Unselected Results */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {sectionResults.length > 0 ? "Other Results" : "Available Results"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Click the action menu to add results to this section
          </p>
        </div>
        {unselectedResults.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            {sectionResults.length > 0
              ? "No other results available"
              : "No results available. Create one to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {unselectedResults.map((item) => (
              <div
                key={item.id}
                className="group relative bg-card border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                    <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <pre className="text-xs font-mono line-clamp-2 whitespace-pre-wrap font-sans">
                          {JSON.stringify(item.content, null, 2)}
                        </pre>
                      </div>
                      <ActionMenu
                        itemId={item.id}
                        editHref={`/admin/results/${item.id}/edit?returnTo=/admin/sections/${sectionId}?pageId=${pageId}&tab=results`}
                        customActions={[
                          {
                            label: "Select",
                            icon: <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />,
                            onClick: async () => {
                              await handleAddResult(item.id);
                            },
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
