"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { RunTable } from "./RunTable";
import type { Run } from "../types";
import { createClient } from "@/lib/supabase/client";

type RunWithKB = Run & { 
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
};

type RunListProps = {
  initialRuns: RunWithKB[];
};

export function RunList({ initialRuns }: RunListProps) {
  const router = useRouter();
  const [runs, setRuns] = useState<RunWithKB[]>(initialRuns);
  const [viewMode, setViewMode] = useViewMode("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    "Run Type": [],
    "Status": [],
  });
  const [selectedSort, setSelectedSort] = useState<string>("Recent");

  const filterCategories: FilterCategory[] = [
    {
      label: "Run Type",
      options: [
        { value: "niche_intelligence", label: "Niche Intelligence" },
        { value: "kb_query", label: "KB Query" },
        { value: "doc_ingest", label: "Document Ingest" },
      ],
    },
    {
      label: "Status",
      options: [
        { value: "queued", label: "Queued" },
        { value: "collecting", label: "Collecting" },
        { value: "ingesting", label: "Ingesting" },
        { value: "generating", label: "Generating" },
        { value: "complete", label: "Complete" },
        { value: "failed", label: "Failed" },
      ],
    },
  ];

  // Sync initialRuns when they change
  useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

  // Set up Supabase real-time subscription for all runs with polling fallback
  useEffect(() => {
    const supabase = createClient();
    let pollInterval: NodeJS.Timeout | null = null;
    
    // Function to refresh runs list
    const refreshRuns = async () => {
      try {
        const response = await fetch("/api/intel/runs");
        if (response.ok) {
          const data = await response.json();
          setRuns((prev) => {
            // Only update if the data actually changed (check by comparing first run's updated_at)
            const newFirstRun = data[0];
            const prevFirstRun = prev[0];
            
            if (newFirstRun && prevFirstRun && newFirstRun.updated_at === prevFirstRun.updated_at && 
                newFirstRun.id === prevFirstRun.id && data.length === prev.length) {
              return prev; // No changes
            }
            
            return data || [];
          });
        }
      } catch (error) {
        // Silently handle errors
      }
    };
    
    // Set up polling as fallback (every 3 seconds)
    pollInterval = setInterval(refreshRuns, 3000);
    
    const channel = supabase
      .channel('rag_runs_all_changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rag_runs',
        },
        async (payload) => {
          console.log('[RunList] Received real-time event:', payload.eventType, (payload.new as any)?.id || (payload.old as any)?.id);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newRun = payload.new as any;
            console.log('[RunList] New run inserted:', newRun.id);
            
            // Fetch the run with its knowledge base and workflow via API
            try {
              const response = await fetch(`/api/intel/runs/${newRun.id}`);
              if (response.ok) {
                const runData = await response.json();
                console.log('[RunList] Fetched new run data:', runData.id);
                setRuns((prev) => {
                  const exists = prev.some((run) => run.id === newRun.id);
                  if (exists) {
                    console.log('[RunList] Run already exists, skipping');
                    return prev;
                  }
                  
                  console.log('[RunList] Adding new run to list');
                  const updated = [runData, ...prev];
                  return updated.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                });
              } else {
                console.error('[RunList] Failed to fetch new run:', response.status, response.statusText);
                // Fallback: refresh the entire list
                refreshRuns();
              }
            } catch (error) {
              console.error('[RunList] Error fetching new run:', error);
              // Fallback: refresh the entire list
              refreshRuns();
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedRun = payload.new as any;
            
            // Fetch updated run with KB and workflow info via API
            try {
              const response = await fetch(`/api/intel/runs/${updatedRun.id}`);
              if (response.ok) {
                const runData = await response.json();
                setRuns((prev) => {
                  return prev.map((run) =>
                    run.id === updatedRun.id ? runData : run
                  );
                });
              } else {
                // Fallback: refresh the entire list
                refreshRuns();
              }
            } catch (error) {
              console.error('[RunList] Error fetching updated run:', error);
              // Fallback: refresh the entire list
              refreshRuns();
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedRun = payload.old as any;
            
            // Remove from list
            setRuns((prev) => {
              return prev.filter((run) => run.id !== deletedRun.id);
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[RunList] ✅ Successfully subscribed to rag_runs changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[RunList] ❌ Channel error - subscription failed');
        } else if (status === 'TIMED_OUT') {
          console.error('[RunList] ❌ Subscription timed out');
        }
      });

    return () => {
      console.log('[RunList] Cleaning up subscription and polling');
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredAndSortedRuns = useMemo(() => {
    let filtered = runs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (run) =>
          run.knowledge_base_name?.toLowerCase().includes(query) ||
          run.run_type.toLowerCase().includes(query) ||
          run.status.toLowerCase().includes(query)
      );
    }

    // Apply run type filter
    const selectedRunTypes = selectedFilters["Run Type"] || [];
    if (selectedRunTypes.length > 0) {
      filtered = filtered.filter((run) => {
        return selectedRunTypes.includes(run.run_type);
      });
    }

    // Apply status filter
    const selectedStatuses = selectedFilters["Status"] || [];
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((run) => {
        return selectedStatuses.includes(run.status);
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (selectedSort) {
      case "Recent":
        sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "Knowledge Base":
        sorted.sort((a, b) => {
          const aName = a.knowledge_base_name || "";
          const bName = b.knowledge_base_name || "";
          return aName.localeCompare(bName);
        });
        break;
      default:
        // Default to Recent
        sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return sorted;
  }, [runs, searchQuery, selectedFilters, selectedSort]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      "Run Type": [],
      "Status": [],
    });
  };

  const sortOptions = ["Recent", "Knowledge Base"];

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search runs..."
        onSearch={setSearchQuery}
        filterCategories={filterCategories}
        selectedFilters={selectedFilters}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSortedRuns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {runs.length === 0
            ? "No runs found."
            : "No runs found matching your search"}
        </motion.div>
      ) : (
        <RunTable runs={filteredAndSortedRuns} />
      )}
    </div>
  );
}
