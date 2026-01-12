"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { RunTable } from "@/features/rag/runs/components/RunTable";
import { Toolbar } from "@/features/rag/shared/components/Toolbar";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import type { Run } from "@/features/rag/runs/types";
import type { RunWithExtras } from "@/features/rag/projects/config/ProjectTypeConfig";
import { cn } from "@/lib/utils";
import { getRunStatusColorString, getRunStatusBadgeClasses, getRunStatusGradientClasses } from "@/features/rag/shared/utils/runStatusColors";

// Helper to get color string for group statuses (groups use aggregated statuses like "processing")
const getGroupStatusColor = (status: string): string => {
  // For "processing" group (which contains collecting/ingesting/generating), use yellow-600
  if (status === "processing") {
    return "yellow-600";
  }
  // Use utility for other statuses
  return getRunStatusColorString(status);
};

type ProjectRunsClientProps = {
  initialRuns: RunWithExtras[];
  projectId: string;
};

// Helper function to extract fit_score and verdict from metadata
const extractFitScoreAndVerdict = (runData: any): { fit_score: number | null; verdict: "pursue" | "test" | "caution" | "avoid" | null } => {
  // Extract from metadata.evaluation_result
  const evaluationResult = runData.metadata?.evaluation_result;
  let fit_score: number | null = null;
  let verdict: "pursue" | "test" | "caution" | "avoid" | null = null;
  
  if (evaluationResult && typeof evaluationResult === "object") {
    // Extract and normalize verdict
    if (evaluationResult.verdict && typeof evaluationResult.verdict === "string") {
      const normalizedVerdict = evaluationResult.verdict.toLowerCase();
      if (normalizedVerdict === "pursue" || normalizedVerdict === "test" || normalizedVerdict === "caution" || normalizedVerdict === "avoid") {
        verdict = normalizedVerdict;
      }
    }
    
    // Extract score
    if (typeof evaluationResult.score === "number") {
      fit_score = evaluationResult.score;
    } else if (typeof evaluationResult.score === "string") {
      const parsedScore = parseFloat(evaluationResult.score);
      if (!isNaN(parsedScore)) {
        fit_score = parsedScore;
      }
    }
  }
  
  return {
    fit_score,
    verdict,
  };
};

export function ProjectRunsClient({
  initialRuns,
  projectId,
}: ProjectRunsClientProps) {
  const [runs, setRuns] = useState<RunWithExtras[]>(initialRuns);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string; label: string }>>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    "Workflow": [],
    "Status": [],
  });
  const [selectedSort, setSelectedSort] = useState<string>("Recent");
  const [groupByStatus, setGroupByStatus] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`project-runs-group-by-status-${projectId}`);
      return saved === "true";
    }
    return false;
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`project-runs-expanded-groups-${projectId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return new Set(parsed);
        } catch {
          // If parsing fails, default to all groups expanded
          return new Set(["processing", "queued", "failed", "complete"]);
        }
      }
      // Default to all groups expanded
      return new Set(["processing", "queued", "failed", "complete"]);
    }
    return new Set(["processing", "queued", "failed", "complete"]);
  });
  const hasInitializedExpansion = useRef(false);

  // Update runs when initialRuns changes (from server refresh)
  useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

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

  // Set up Supabase real-time subscription for runs
  useEffect(() => {
    const supabase = createClient();
    
    console.log('[ProjectRunsClient] 🔌 Setting up runs subscription for project:', projectId);
    
    let pollInterval: NodeJS.Timeout | null = null;
    let subscriptionActive = false;
    
    // Helper function to refresh runs (for polling fallback only)
    const refreshRuns = async () => {
      // Only poll if subscription is not active
      if (subscriptionActive) {
        return;
      }
      
      try {
        const { data: runsData, error } = await supabase
          .from('rag_runs')
          .select(`
            *,
            rag_knowledge_bases (name),
            workflows (name, label)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('[ProjectRunsClient] Error refreshing runs:', error);
          return;
        }
        
        if (runsData && runsData.length > 0) {
          const runsWithExtras: RunWithExtras[] = runsData.map((run: any) => {
            const kbName = run.rag_knowledge_bases?.name || null;
            const workflowName = run.workflows?.name || null;
            const workflowLabel = run.workflows?.label || null;
            
            // Extract fit_score and verdict from metadata
            const { fit_score, verdict } = extractFitScoreAndVerdict(run);
            
            return {
              ...(run as Run),
              knowledge_base_name: kbName,
              workflow_name: workflowName,
              workflow_label: workflowLabel,
              report_id: null, // Not loading rag_run_outputs
              fit_score,
              verdict,
            };
          });
          
          setRuns((prev) => {
            // Only update if we have data, otherwise keep previous state
            if (runsWithExtras.length > 0) {
              return runsWithExtras;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('[ProjectRunsClient] Exception refreshing runs:', error);
      }
    };
    
    // Set up polling as fallback (every 5 seconds, only if subscription fails)
    // Start with a longer interval, will be cleared if subscription works
    pollInterval = setInterval(refreshRuns, 5000);
    
    // Helper function to fetch run with all relations
    const fetchRunWithExtras = async (runId: string): Promise<RunWithExtras | null> => {
      try {
        const { data: runData, error } = await supabase
          .from('rag_runs')
          .select(`
            *,
            rag_knowledge_bases (name),
            workflows (name, label)
          `)
          .eq('id', runId)
          .single();
        
        if (error) {
          console.error('[ProjectRunsClient] Error fetching run:', error);
          return null;
        }
        
        if (!runData) return null;
        
        const kbName = (runData as any).rag_knowledge_bases?.name || null;
        const workflowName = (runData as any).workflows?.name || null;
        const workflowLabel = (runData as any).workflows?.label || null;
        
        // Extract fit_score and verdict from metadata
        const { fit_score, verdict } = extractFitScoreAndVerdict(runData);
        
        return {
          ...(runData as Run),
          knowledge_base_name: kbName,
          workflow_name: workflowName,
          workflow_label: workflowLabel,
          report_id: null, // Not loading rag_run_outputs
          fit_score,
          verdict,
        };
      } catch (error) {
        console.error('[ProjectRunsClient] Exception fetching run:', error);
        return null;
      }
    };
    
    // Channel for rag_runs table - subscribe to ALL runs (no filter) like RunList
    // Filter client-side to only process runs for this project
    const runsChannel = supabase
      .channel(`rag_runs_project_${projectId}`, {
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
          const runId = (payload.new as any)?.id || (payload.old as any)?.id;
          const runProjectId = (payload.new as any)?.project_id || (payload.old as any)?.project_id;
          
          console.log('[ProjectRunsClient] 🏃 Run change detected:', {
            projectId,
            runProjectId,
            eventType: payload.eventType,
            runId,
            matchesProject: runProjectId === projectId,
            payloadKeys: payload.new ? Object.keys(payload.new) : null,
          });
          
          // Filter client-side - only process runs for this project
          // BUT: For UPDATE events, project_id might not be in payload.new if only metadata changed
          // So we need to check if the run exists in our current list first
          if (payload.eventType === 'UPDATE') {
            // For UPDATE, check if run exists in our list (it should if it belongs to this project)
            // If it doesn't exist, it might belong to another project, but let's still try to fetch it
            // to be safe (the API will return it if it exists and we have access)
            console.log('[ProjectRunsClient] UPDATE event - will check if run exists in current list');
          } else {
            // For INSERT and DELETE, filter by project_id
            if (runProjectId && runProjectId !== projectId) {
              console.log('[ProjectRunsClient] Run belongs to different project, ignoring');
              return;
            }
          }

          if (payload.eventType === 'INSERT' && payload.new) {
            const newRun = payload.new as any;
            console.log('[ProjectRunsClient] New run inserted:', newRun.id);
            
            // Fetch the run with its knowledge base and workflow via API (like RunList)
            try {
              const response = await fetch(`/api/intel/runs/${newRun.id}`);
              if (response.ok) {
                const runData = await response.json();
                const { fit_score, verdict } = extractFitScoreAndVerdict(runData);
                const runWithExtras = {
                  ...runData,
                  fit_score,
                  verdict,
                };
                console.log('[ProjectRunsClient] Fetched new run data:', runData.id);
                setRuns((prev) => {
                  const exists = prev.some((run) => run.id === newRun.id);
                  if (exists) {
                    console.log('[ProjectRunsClient] Run already exists, skipping');
                    return prev;
                  }
                  
                  console.log('[ProjectRunsClient] Adding new run to list');
                  const updated = [runWithExtras, ...prev];
                  return updated.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                });
              } else {
                console.error('[ProjectRunsClient] Failed to fetch new run:', response.status, response.statusText);
                // Fallback: use direct query
                const runWithExtras = await fetchRunWithExtras(newRun.id);
                if (runWithExtras) {
                  setRuns((prev) => {
                    const exists = prev.some((run) => run.id === newRun.id);
                    if (exists) return prev;
                    const updated = [runWithExtras, ...prev];
                    return updated.sort((a, b) => 
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                  });
                }
              }
            } catch (error) {
              console.error('[ProjectRunsClient] Error fetching new run:', error);
              // Fallback: use direct query
              const runWithExtras = await fetchRunWithExtras(newRun.id);
              if (runWithExtras) {
                setRuns((prev) => {
                  const exists = prev.some((run) => run.id === newRun.id);
                  if (exists) return prev;
                  const updated = [runWithExtras, ...prev];
                  return updated.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                });
              }
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedRun = payload.new as any;
            const updatedProjectId = updatedRun.project_id;
            
            console.log('[ProjectRunsClient] Run updated:', {
              runId: updatedRun.id,
              projectId: updatedProjectId,
              ourProjectId: projectId,
              status: updatedRun.status,
              hasMetadata: !!updatedRun.metadata,
            });
            
            // Only process if this run belongs to our project
            if (updatedProjectId && updatedProjectId !== projectId) {
              console.log('[ProjectRunsClient] Updated run belongs to different project, ignoring');
              return;
            }
            
            // Fetch updated run with KB and workflow info via API (like RunList)
            try {
              const response = await fetch(`/api/intel/runs/${updatedRun.id}`);
              if (response.ok) {
                const runData = await response.json();
                const { fit_score, verdict } = extractFitScoreAndVerdict(runData);
                const runWithExtras = {
                  ...runData,
                  fit_score,
                  verdict,
                };
                console.log('[ProjectRunsClient] ✅ Fetched updated run from API:', {
                  runId: runData.id,
                  status: runData.status,
                  projectId: runData.project_id,
                  hasMetadata: !!runData.metadata,
                });
                
                // Double-check project_id from API response
                if (runData.project_id !== projectId) {
                  console.log('[ProjectRunsClient] API returned run for different project, ignoring');
                  return;
                }
                
                setRuns((prev) => {
                  const exists = prev.some((run) => run.id === updatedRun.id);
                  console.log('[ProjectRunsClient] Updating run in state, exists:', exists);
                  
                  if (!exists) {
                    // Run not in list, add it
                    const updated = [runWithExtras, ...prev];
                    return updated.sort((a, b) => 
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                  }
                  
                  return prev.map((run) =>
                    run.id === updatedRun.id ? runWithExtras : run
                  );
                });
              } else {
                console.error('[ProjectRunsClient] Failed to fetch updated run from API:', response.status);
                // Fallback: refresh the entire list
                refreshRuns();
              }
            } catch (error) {
              console.error('[ProjectRunsClient] Error fetching updated run:', error);
              // Fallback: refresh the entire list
              refreshRuns();
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedRun = payload.old as any;
            console.log('[ProjectRunsClient] Run deleted:', deletedRun.id);
            
            setRuns((prev) => {
              return prev.filter((run) => run.id !== deletedRun.id);
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          subscriptionActive = true;
          console.log('[ProjectRunsClient] ✅ Successfully subscribed to rag_runs changes for project:', projectId);
          // Clear polling since subscription is working
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
            console.log('[ProjectRunsClient] Polling disabled - subscription active');
          }
        } else if (status === 'CHANNEL_ERROR') {
          subscriptionActive = false;
          console.error('[ProjectRunsClient] ❌ Channel error - subscription failed for project:', projectId);
          // Log additional debugging info
          console.error('[ProjectRunsClient] Common causes:');
          console.error('  1. REPLICA IDENTITY FULL not set on rag_runs table (run migration 20260107000010)');
          console.error('  2. Table not added to supabase_realtime publication');
          console.error('  3. RLS policies blocking realtime access');
          console.error('  4. Network/connection issues');
          // Ensure polling is running as fallback
          if (!pollInterval) {
            pollInterval = setInterval(refreshRuns, 5000);
            console.log('[ProjectRunsClient] Polling enabled as fallback');
          }
        } else if (status === 'TIMED_OUT') {
          subscriptionActive = false;
          console.error('[ProjectRunsClient] ❌ Subscription timed out for project:', projectId);
          // Ensure polling is running as fallback
          if (!pollInterval) {
            pollInterval = setInterval(refreshRuns, 5000);
            console.log('[ProjectRunsClient] Polling enabled as fallback');
          }
        } else if (status === 'CLOSED') {
          subscriptionActive = false;
          console.log('[ProjectRunsClient] 📡 Subscription closed for project:', projectId);
          // Ensure polling is running as fallback
          if (!pollInterval) {
            pollInterval = setInterval(refreshRuns, 5000);
            console.log('[ProjectRunsClient] Polling enabled as fallback');
          }
        } else {
          console.log('[ProjectRunsClient] 📡 Subscription status:', status, 'for project:', projectId);
        }
      });

    return () => {
      console.log('[ProjectRunsClient] 🧹 Cleaning up runs subscription for project:', projectId);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      supabase.removeChannel(runsChannel);
    };
  }, [projectId]);

  const filterCategories: FilterCategory[] = [
    {
      label: "Workflow",
      options: workflows.map((workflow) => ({
        value: workflow.id,
        label: workflow.label || workflow.name,
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

  // Expand all groups by default when grouping is first enabled (only if no saved state exists)
  useEffect(() => {
    if (groupByStatus && !hasInitializedExpansion.current) {
      // Only set default if localStorage doesn't have a saved state
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`project-runs-expanded-groups-${projectId}`);
        if (!saved) {
          const statuses = ["processing", "queued", "failed", "complete"];
          setExpandedGroups(new Set(statuses));
        }
      }
      hasInitializedExpansion.current = true;
    }
    if (!groupByStatus) {
      hasInitializedExpansion.current = false;
    }
  }, [groupByStatus, projectId]);

  // Save expanded groups state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && groupByStatus) {
      const expandedArray = Array.from(expandedGroups);
      localStorage.setItem(`project-runs-expanded-groups-${projectId}`, JSON.stringify(expandedArray));
    }
  }, [expandedGroups, groupByStatus, projectId]);

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
    // Always sort by Recent (most recent first)
    sorted.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sorted;
  }, [runs, searchQuery, selectedFilters, selectedSort]);

  // Group runs by status when grouping is enabled
  const groupedRuns = useMemo(() => {
    if (!groupByStatus) {
      return null;
    }

    const groups: Record<string, RunWithExtras[]> = {
      processing: [],
      queued: [],
      failed: [],
      complete: [],
    };

    filteredAndSortedRuns.forEach((run) => {
      const status = run.status;
      // Group processing states together (generating, ingesting, collecting)
      if (status === 'generating' || status === 'ingesting' || status === 'collecting') {
        groups.processing.push(run);
      } else if (groups[status]) {
        groups[status].push(run);
      } else {
        // Handle unknown statuses - create their own group
        if (!groups[status]) {
          groups[status] = [];
        }
        groups[status].push(run);
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

  const handleFilterApply = (filters: Record<string, string[]>) => {
    setSelectedFilters(filters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      "Workflow": [],
      "Status": [],
    });
  };

  const sortOptions = ["Recent"];

  return (
    <div className="w-full space-y-6">
      <Toolbar
        searchPlaceholder="Search researches..."
        onSearch={setSearchQuery}
        filterCategories={filterCategories}
        selectedFilters={selectedFilters}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {filteredAndSortedRuns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-muted-foreground"
        >
          {runs.length === 0
            ? "No researches found for this project."
            : "No researches found matching your search"}
        </motion.div>
      ) : groupByStatus && groupedRuns ? (
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
              // Order: processing first, queued second, failed third, completed last
              const order: Record<string, number> = {
                processing: 0,
                queued: 1,
                failed: 2,
                complete: 3,
              };
              return (order[a] ?? 99) - (order[b] ?? 99);
            })
            .map(([status, statusRuns]) => {
              const statusLabels: Record<string, string> = {
                processing: "Processing",
                queued: "Queued",
                failed: "Failed",
                complete: "Complete",
              };
              const statusLabel = statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);

              // Get the color for this status using utility
              const statusColorValue = getGroupStatusColor(status);
              
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
              const dotColor = getDotColorClass(statusColorValue);
              
              // Get group header badge classes using utility (for processing group, use yellow)
              const statusHeaderBadgeClasses = getRunStatusBadgeClasses(status === "processing" ? "processing" : status);

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
                      <span className={cn("h-2 w-2 rounded-full", dotColor)}></span>
                      <h3 className="text-sm font-semibold text-foreground capitalize">{statusLabel}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {statusRuns.length} {statusRuns.length === 1 ? "research" : "researches"}
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2">
                      <RunTable
                        runs={statusRuns}
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
        <RunTable runs={filteredAndSortedRuns} />
      )}
    </div>
  );
}

