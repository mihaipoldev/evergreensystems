"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar } from "@/features/rag/shared/components/Toolbar";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { RunTable } from "./RunTable";
import type { Run } from "../types";
import { createClient } from "@/lib/supabase/client";
import { getRunStatusBadgeClasses, getRunStatusColorString } from "@/features/rag/shared/utils/runStatusColors";

type RunWithKB = Run & { 
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
};

type RunListProps = {
  initialRuns: RunWithKB[];
};

const STORAGE_KEY_PREFIX = "research-";
const STORAGE_KEY_SEARCH = `${STORAGE_KEY_PREFIX}search`;
const STORAGE_KEY_FILTERS = `${STORAGE_KEY_PREFIX}filters`;
const STORAGE_KEY_SORT = `${STORAGE_KEY_PREFIX}sort`;
const STORAGE_KEY_GROUP_BY_STATUS = "runs-group-by-status";

// Helper functions for localStorage persistence
function getStoredSearch(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY_SEARCH) || "";
  } catch {
    return "";
  }
}

function setStoredSearch(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SEARCH, value);
  } catch {
    // Ignore localStorage errors
  }
}

function getStoredFilters(): Record<string, string[]> {
  if (typeof window === "undefined") return { "Workflow": [], "Status": [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : { "Workflow": [], "Status": [] };
    }
  } catch {
    // Ignore parse errors
  }
  return { "Workflow": [], "Status": [] };
}

function setStoredFilters(filters: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
  } catch {
    // Ignore localStorage errors
  }
}

function getStoredSort(): string {
  if (typeof window === "undefined") return "Recent";
  try {
    return localStorage.getItem(STORAGE_KEY_SORT) || "Recent";
  } catch {
    return "Recent";
  }
}

function setStoredSort(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SORT, value);
  } catch {
    // Ignore localStorage errors
  }
}

function getStoredGroupByStatus(): string {
  if (typeof window === "undefined") return "none";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GROUP_BY_STATUS);
    if (saved === "true") {
      // Migrate from old boolean format
      localStorage.setItem(STORAGE_KEY_GROUP_BY_STATUS, "status");
      return "status";
    }
    if (saved === "false") {
      localStorage.setItem(STORAGE_KEY_GROUP_BY_STATUS, "none");
      return "none";
    }
    return saved || "none";
  } catch {
    return "none";
  }
}

function setStoredGroupByStatus(value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_GROUP_BY_STATUS, value);
  } catch {
    // Ignore localStorage errors
  }
}

export function RunList({ initialRuns }: RunListProps) {
  const router = useRouter();
  const [runs, setRuns] = useState<RunWithKB[]>(initialRuns);
  // Initialize state from localStorage directly to avoid flash of default values
  const [searchQuery, setSearchQuery] = useState(() => getStoredSearch());
  const [workflows, setWorkflows] = useState<Array<{ id: string; slug: string; name: string }>>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => getStoredFilters());
  const [selectedSort, setSelectedSort] = useState<string>(() => getStoredSort());
  const [groupByStatus, setGroupByStatus] = useState(() => getStoredGroupByStatus());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const hasInitializedExpansion = useRef(false);
  const hasLoadedFromStorage = useRef(false);

  // Mark as loaded after first render
  useEffect(() => {
    hasLoadedFromStorage.current = true;
  }, []);

  const filterCategories: FilterCategory[] = [
    {
      label: "Workflow",
      options: workflows.map((workflow) => ({
        value: workflow.id,
        label: workflow.name || workflow.slug,
      })),
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

  // Fetch workflows for filtering
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const response = await fetch("/api/intel/workflows?enabled=true", {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWorkflows(data || []);
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
      }
    };

    fetchWorkflows();
  }, []);

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
          run.status.toLowerCase().includes(query) ||
          run.workflow_label?.toLowerCase().includes(query) ||
          run.workflow_name?.toLowerCase().includes(query)
      );
    }

    // Apply workflow filter (prefer workflow_id, fallback to workflow_name for backward compatibility)
    const selectedWorkflows = selectedFilters["Workflow"] || [];
    if (selectedWorkflows.length > 0) {
      filtered = filtered.filter((run) => {
        // Match by workflow_id (primary) or workflow_name (fallback)
        return run.workflow_id && selectedWorkflows.includes(run.workflow_id) ||
               (run.workflow_name && selectedWorkflows.includes(run.workflow_name));
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

  // Expand all groups by default when grouping is first enabled
  useEffect(() => {
    if (groupByStatus !== "none" && !hasInitializedExpansion.current) {
      const statuses = ["complete", "generating", "ingesting", "collecting", "queued", "failed"];
      setExpandedGroups(new Set(statuses));
      hasInitializedExpansion.current = true;
    }
    if (groupByStatus === "none") {
      hasInitializedExpansion.current = false;
    }
  }, [groupByStatus]);

  // Group runs by status when grouping is enabled
  const groupedRuns = useMemo(() => {
    if (groupByStatus === "none") {
      return null;
    }

    const groups: Record<string, RunWithKB[]> = {
      complete: [],
      generating: [],
      ingesting: [],
      collecting: [],
      queued: [],
      failed: [],
    };

    filteredAndSortedRuns.forEach((run) => {
      const status = run.status;
      if (groups[status]) {
        groups[status].push(run);
      } else {
        // Handle unknown statuses
        if (!groups.other) {
          groups.other = [];
        }
        groups.other.push(run);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [filteredAndSortedRuns, groupByStatus]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Persist search query changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredSearch(searchQuery);
    }
  }, [searchQuery]);

  // Persist filter changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredFilters(selectedFilters);
    }
  }, [selectedFilters]);

  // Persist sort changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredSort(selectedSort);
    }
  }, [selectedSort]);

  // Persist groupByStatus changes (only after initial load)
  useEffect(() => {
    if (hasLoadedFromStorage.current) {
      setStoredGroupByStatus(groupByStatus);
    }
  }, [groupByStatus]);

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    const clearedFilters = {
      "Workflow": [],
      "Status": [],
    };
    setSelectedFilters(clearedFilters);
  };

  const sortOptions = ["Recent", "Knowledge Base"];

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search runs..."
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        filterCategories={filterCategories}
        selectedFilters={selectedFilters}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        groupByStatus={{
          options: [
            { value: "none", label: "None" },
            { value: "status", label: "Status" },
          ],
          selectedValue: groupByStatus,
          onSelect: (value: string) => {
            setGroupByStatus(value);
          },
        }}
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
      ) : groupByStatus !== "none" && groupedRuns ? (
        <TooltipProvider delayDuration={100}>
          <div className="space-y-2">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex-1 min-w-0">Run</div>
              <div className="w-28 shrink-0">Result</div>
              <div className="w-44 shrink-0">Progress</div>
              <div className="w-40 shrink-0">Created</div>
              <div className="w-20 shrink-0 text-right">Actions</div>
            </div>

            {/* Status Groups */}
            {Object.entries(groupedRuns)
            .sort(([a], [b]) => {
              // Order: complete, generating, ingesting, collecting, queued, failed, other
              const order: Record<string, number> = {
                complete: 0,
                generating: 1,
                ingesting: 2,
                collecting: 3,
                queued: 4,
                failed: 5,
                other: 6,
              };
              return (order[a] ?? 99) - (order[b] ?? 99);
            })
            .map(([status, statusRuns]) => {
              const statusLabels: Record<string, string> = {
                complete: "Complete",
                generating: "Generating",
                ingesting: "Ingesting",
                collecting: "Collecting",
                queued: "Queued",
                failed: "Failed",
                other: "Other",
              };
              const statusLabel = statusLabels[status] || status;

              // Use utility for status badge classes and dot color
              const statusBadgeClasses = getRunStatusBadgeClasses(status);
              const statusColorString = getRunStatusColorString(status);
              
              // Map color string to Tailwind bg class for dot indicator
              const getDotColorClass = (colorString: string): string => {
                switch (colorString) {
                  case "blue-600":
                    return "bg-blue-600";
                  case "orange-600":
                    return "bg-orange-600";
                  case "red-600":
                    return "bg-red-600";
                  case "green-600":
                    return "bg-green-600";
                  case "yellow-600":
                    return "bg-yellow-600";
                  case "purple-600":
                    return "bg-purple-600";
                  default:
                    return "bg-muted";
                }
              };
              const dotColor = getDotColorClass(statusColorString);

              return (
                <Collapsible
                  key={status}
                  open={expandedGroups.has(status)}
                  onOpenChange={() => toggleGroup(status)}
                >
                  <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg">
                    <FontAwesomeIcon
                      icon={expandedGroups.has(status) ? faChevronDown : faChevronRight}
                      className="h-4 w-4 text-muted-foreground shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className={`h-2 w-2 rounded-full ${dotColor}`}></span>
                      <h3 className="text-sm font-semibold text-foreground capitalize">{statusLabel}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {statusRuns.length} {statusRuns.length === 1 ? "run" : "runs"}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2">
                      <RunTable
                        runs={statusRuns}
                        onDelete={() => {
                          router.refresh();
                        }}
                        hideHeader={true}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </TooltipProvider>
      ) : (
        <RunTable 
          runs={filteredAndSortedRuns} 
          onDelete={() => {
            // Refresh runs list after deletion
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
