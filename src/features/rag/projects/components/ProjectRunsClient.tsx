"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { RunTable } from "@/features/rag/runs/components/RunTable";
import { Toolbar } from "@/features/rag/shared/components/Toolbar";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/lib/supabase/client";
import type { Run } from "@/features/rag/runs/types";
import { extractWorkflowResult } from "@/features/rag/runs/utils/extractWorkflowResult";
import type { RunWithExtras } from "@/features/rag/projects/config/ProjectTypeConfig";
import { FitScoreAndVerdict } from "@/features/rag/shared/components/FitScoreAndVerdict";

type WorkflowWithOrder = {
  id: string;
  slug: string;
  name: string;
  display_order?: number;
};

type ProjectRunsClientProps = {
  initialRuns: RunWithExtras[];
  projectId: string;
  projectTypeId?: string | null;
  onGenerateClick?: () => void;
  /** Called when user clicks Generate for a specific workflow - opens modal with that workflow selected */
  onGenerateWorkflowClick?: (workflowId: string) => void;
};

// Extract fit_score and verdict: tries NEW format (output_json) first, then OLD (metadata.evaluation_result)
const getFitScoreAndVerdict = (runData: any): { fit_score: number | null; verdict: "pursue" | "test" | "caution" | "avoid" | null } => {
  const runOutputs = runData.rag_run_outputs;
  const outputJson =
    Array.isArray(runOutputs) && runOutputs.length > 0
      ? runOutputs[0]?.output_json
      : runOutputs?.output_json ?? undefined;
  const runWithOutput = { ...runData, output_json: outputJson };
  const result = extractWorkflowResult(runWithOutput);
  return {
    fit_score: result?.score ?? null,
    verdict: result?.verdict ?? null,
  };
};

export function ProjectRunsClient({
  initialRuns,
  projectId,
  projectTypeId,
  onGenerateClick,
  onGenerateWorkflowClick,
}: ProjectRunsClientProps) {
  const [runs, setRuns] = useState<RunWithExtras[]>(initialRuns);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [workflows, setWorkflows] = useState<WorkflowWithOrder[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    "Workflow": [],
    "Status": [],
  });
  const [selectedSort, setSelectedSort] = useState<string>("Recent");
  // Group by: "none" = flat list, "workflow" = grouped by workflow (only when projectTypeId exists)
  const [groupBy, setGroupBy] = useState<string>(() => {
    if (typeof window !== "undefined" && projectTypeId) {
      const saved = localStorage.getItem(`project-runs-group-by-${projectId}`);
      if (saved === "none" || saved === "workflow") return saved;
    }
    return projectTypeId ? "workflow" : "none";
  });
  // When projectTypeId exists: expanded workflow IDs. When not: N/A (flat list).
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(() => {
    if (typeof window !== "undefined" && projectTypeId) {
      const saved = localStorage.getItem(`project-runs-expanded-workflows-${projectId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return new Set(parsed);
        } catch {
          return new Set<string>();
        }
      }
    }
    return new Set<string>();
  });

  // Update runs when initialRuns changes (from server refresh)
  useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

  // Fetch workflows for filtering (project-type workflows when projectTypeId exists, else all enabled)
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const apiUrl = projectTypeId
          ? `/api/intel/project-types/workflows?project_type_id=${encodeURIComponent(projectTypeId)}`
          : "/api/intel/workflows?enabled=true";

        const response = await fetch(apiUrl, {
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
  }, [projectTypeId]);

  // Set up Supabase real-time subscription for runs + fallback polling for progress
  useEffect(() => {
    const supabase = createClient();
    
    let pollInterval: NodeJS.Timeout | null = null;
    let subscriptionActive = false;
    
    // Helper function to refresh runs (used by polling fallback)
    const refreshRuns = async () => {
      try {
        const { data: runsData, error } = await supabase
          .from('rag_runs')
          .select(`
            *,
            rag_knowledge_bases (name),
            workflows (slug, name),
            rag_run_outputs (id, output_json)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('[ProjectRunsClient] Error refreshing runs:', error);
          return;
        }
        
        const runsWithExtras: RunWithExtras[] = (runsData || []).map((run: any) => {
          const kbName = run.rag_knowledge_bases?.name || null;
          const workflowName = run.workflows?.slug || null;
          const workflowLabel = run.workflows?.name || null;
          const runOutputs = run.rag_run_outputs;
          const report_id =
            Array.isArray(runOutputs) && runOutputs.length > 0
              ? runOutputs[0].id
              : runOutputs?.id ?? null;
          
          const { fit_score, verdict } = getFitScoreAndVerdict(run);
          const outputJson =
            Array.isArray(runOutputs) && runOutputs.length > 0
              ? runOutputs[0]?.output_json
              : runOutputs?.output_json ?? undefined;
          
          return {
            ...(run as Run),
            output_json: outputJson,
            knowledge_base_name: kbName,
            workflow_name: workflowName,
            workflow_label: workflowLabel,
            report_id,
            fit_score,
            verdict,
          };
        });
        
        setRuns((prev) => {
          // Always update when we have fresh data from server
          if (runsWithExtras.length > 0) return runsWithExtras;
          // Keep previous state if we got empty (e.g. no runs yet)
          return prev.length > 0 ? prev : runsWithExtras;
        });
      } catch (error) {
        console.error('[ProjectRunsClient] Exception refreshing runs:', error);
      }
    };
    
    // Fallback polling: when subscription is NOT active, poll every 3s; when active, poll every 15s for progress
    const startPolling = (intervalMs: number) => {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(refreshRuns, intervalMs);
    };
    
    // Start polling immediately (covers subscription delay and ensures progress updates)
    startPolling(3000);
    
    // Helper function to fetch run with all relations
    const fetchRunWithExtras = async (runId: string): Promise<RunWithExtras | null> => {
      try {
        const { data: runData, error } = await supabase
          .from('rag_runs')
          .select(`
            *,
            rag_knowledge_bases (name),
            workflows (slug, name),
            rag_run_outputs (id, output_json)
          `)
          .eq('id', runId)
          .single();
        
        if (error) {
          console.error('[ProjectRunsClient] Error fetching run:', error);
          return null;
        }
        
        if (!runData) return null;
        
        const kbName = (runData as any).rag_knowledge_bases?.name || null;
        const workflowName = (runData as any).workflows?.slug || null;
        const workflowLabel = (runData as any).workflows?.name || null;
        const runOutputs = (runData as any).rag_run_outputs;
        const report_id =
          Array.isArray(runOutputs) && runOutputs.length > 0
            ? runOutputs[0].id
            : runOutputs?.id ?? null;
        const outputJson =
          Array.isArray(runOutputs) && runOutputs.length > 0
            ? runOutputs[0]?.output_json
            : runOutputs?.output_json ?? undefined;
        
        const { fit_score, verdict } = getFitScoreAndVerdict(runData);
        
        return {
          ...(runData as Run),
          output_json: outputJson,
          knowledge_base_name: kbName,
          workflow_name: workflowName,
          workflow_label: workflowLabel,
          report_id,
          fit_score,
          verdict,
        };
      } catch (error) {
        console.error('[ProjectRunsClient] Exception fetching run:', error);
        return null;
      }
    };
    
    // Channel for rag_runs - use filter to only receive events for this project's runs
    // (DELETE events can't be filtered per Supabase, so we filter those client-side)
    const runsChannel = supabase
      .channel(`rag_runs_project_${projectId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rag_runs',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          if (payload.eventType !== 'INSERT' || !payload.new) return;
          const newRun = payload.new as any;
          try {
            const response = await fetch(`/api/intel/runs/${newRun.id}`);
            if (response.ok) {
              const runData = await response.json();
              const { fit_score, verdict } = getFitScoreAndVerdict(runData);
              const runWithExtras = { ...runData, fit_score, verdict };
              setRuns((prev) => {
                if (prev.some((r) => r.id === newRun.id)) return prev;
                const updated = [runWithExtras, ...prev];
                return updated.sort((a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              });
            } else {
              const runWithExtras = await fetchRunWithExtras(newRun.id);
              if (runWithExtras) {
                setRuns((prev) => {
                  if (prev.some((r) => r.id === newRun.id)) return prev;
                  const updated = [runWithExtras, ...prev];
                  return updated.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                });
              }
            }
          } catch {
            const runWithExtras = await fetchRunWithExtras(newRun.id);
            if (runWithExtras) {
              setRuns((prev) => {
                if (prev.some((r) => r.id === newRun.id)) return prev;
                const updated = [runWithExtras, ...prev];
                return updated.sort((a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rag_runs',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          if (payload.eventType !== 'UPDATE' || !payload.new) return;
          const updatedRun = payload.new as any;
          try {
            const response = await fetch(`/api/intel/runs/${updatedRun.id}`);
            if (response.ok) {
              const runData = await response.json();
              if (runData.project_id !== projectId) return;
              const { fit_score, verdict } = getFitScoreAndVerdict(runData);
              const runWithExtras = { ...runData, fit_score, verdict };
              setRuns((prev) => {
                const exists = prev.some((r) => r.id === updatedRun.id);
                if (!exists) {
                  const updated = [runWithExtras, ...prev];
                  return updated.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                }
                return prev.map((r) => (r.id === updatedRun.id ? runWithExtras : r));
              });
            } else {
              refreshRuns();
            }
          } catch {
            refreshRuns();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'rag_runs',
        },
        (payload) => {
          const deletedRun = payload.old as any;
          const runProjectId = deletedRun?.project_id;
          if (runProjectId && runProjectId !== projectId) return;
          setRuns((prev) => prev.filter((r) => r.id !== deletedRun?.id));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          subscriptionActive = true;
          // Fallback poll (5s) for progress bar updates - subscription handles real-time, poll catches any misses
          startPolling(5000);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          subscriptionActive = false;
          startPolling(3000);
        }
      });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(runsChannel);
    };
  }, [projectId]);

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

  // When projectTypeId exists and workflows load: default-expand all workflow groups if no saved state
  useEffect(() => {
    if (projectTypeId && workflows.length > 0 && typeof window !== "undefined") {
      const saved = localStorage.getItem(`project-runs-expanded-workflows-${projectId}`);
      if (!saved) {
        setExpandedWorkflows(new Set([...workflows.map((w) => w.id), "_other"]));
      }
    }
  }, [projectTypeId, projectId, workflows]);

  // Save expanded workflow state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && projectTypeId && expandedWorkflows.size > 0) {
      const expandedArray = Array.from(expandedWorkflows);
      localStorage.setItem(`project-runs-expanded-workflows-${projectId}`, JSON.stringify(expandedArray));
    }
  }, [expandedWorkflows, projectTypeId, projectId]);

  // Save groupBy to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && projectTypeId) {
      localStorage.setItem(`project-runs-group-by-${projectId}`, groupBy);
    }
  }, [groupBy, projectTypeId, projectId]);

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

  // Group runs by workflow when projectTypeId exists (using project-type workflow order)
  const groupedRunsByWorkflow = useMemo(() => {
    if (!projectTypeId || workflows.length === 0) {
      return null;
    }

    const workflowIds = new Set(workflows.map((w) => w.id));

    // Build map: workflow_id -> runs (runs sorted by created_at desc within each group)
    const runsByWorkflowId = new Map<string, RunWithExtras[]>();
    filteredAndSortedRuns.forEach((run) => {
      const wfId = run.workflow_id || run.workflow_name || "unknown";
      if (!runsByWorkflowId.has(wfId)) {
        runsByWorkflowId.set(wfId, []);
      }
      runsByWorkflowId.get(wfId)!.push(run);
    });

    // Project-type workflow groups in display_order (workflows already ordered from API)
    const groups = workflows.map((workflow) => ({
      workflow,
      runs: (runsByWorkflowId.get(workflow.id) || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));

    // Add "Other" for runs whose workflow is not in project type
    const otherRuns = filteredAndSortedRuns.filter(
      (run) => !run.workflow_id || !workflowIds.has(run.workflow_id)
    );
    if (otherRuns.length > 0) {
      groups.push({
        workflow: { id: "_other", slug: "other", name: "Other", display_order: 999 },
        runs: otherRuns.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      });
    }

    return groups;
  }, [filteredAndSortedRuns, projectTypeId, workflows]);

  const toggleWorkflow = (workflowId: string) => {
    setExpandedWorkflows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
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
    <div className="w-full space-y-4">
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
        groupByStatus={
          projectTypeId
            ? {
                options: [
                  { value: "none", label: "None" },
                  { value: "workflow", label: "Workflow" },
                ],
                selectedValue: groupBy,
                onSelect: setGroupBy,
              }
            : undefined
        }
        actionAfterSort={
          onGenerateClick
            ? { label: "Generate Report", onClick: onGenerateClick }
            : undefined
        }
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
      ) : projectTypeId && groupBy === "workflow" && groupedRunsByWorkflow ? (
        <TooltipProvider delayDuration={100}>
          <div className="space-y-2">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex-1 min-w-0">Run</div>
              <div className="w-20 shrink-0">Usage</div>
              <div className="w-28 shrink-0">Result</div>
              <div className="w-44 shrink-0">Progress</div>
              <div className="w-40 shrink-0">Last updated</div>
              <div className="w-20 shrink-0 text-right">Actions</div>
            </div>

            {/* Workflow Groups */}
            {groupedRunsByWorkflow.map(({ workflow, runs: workflowRuns }) => {
              const workflowLabel = workflow.name || workflow.slug;
              const isExpanded = expandedWorkflows.has(workflow.id);
              const isNicheFitEvaluation = workflow.slug === "niche_fit_evaluation";

              // Latest complete run for fit score (niche_fit_evaluation only)
              const latestCompleteRun = isNicheFitEvaluation
                ? workflowRuns.find((r) => r.status === "complete")
                : null;
              const workflowResult = latestCompleteRun
                ? extractWorkflowResult(latestCompleteRun)
                : null;

              // Most recent updated_at in this group
              const lastUpdated =
                workflowRuns.length > 0
                  ? workflowRuns.reduce((latest, r) => {
                      const rDate = new Date(r.updated_at).getTime();
                      return rDate > latest ? rDate : latest;
                    }, 0)
                  : null;
              const formattedLastUpdated = lastUpdated
                ? new Date(lastUpdated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;

              return (
                <Collapsible
                  key={workflow.id}
                  open={isExpanded}
                  onOpenChange={() => toggleWorkflow(workflow.id)}
                >
                  <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors rounded-lg">
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronDown : faChevronRight}
                      className="h-4 w-4 text-muted-foreground shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-sm font-semibold text-foreground">
                        {workflowLabel}
                      </h3>
                      {formattedLastUpdated && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Last updated: {formattedLastUpdated}
                        </div>
                      )}
                    </div>
                    {isNicheFitEvaluation && workflowResult && (
                      <div className="shrink-0">
                        <FitScoreAndVerdict
                          fit_score={workflowResult.score}
                          verdict={workflowResult.verdict}
                          variant="header"
                        />
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0">
                      {workflowRuns.length}{" "}
                      {workflowRuns.length === 1 ? "research" : "researches"}
                    </span>
                    {workflow.id !== "_other" && onGenerateWorkflowClick && (
                      <button
                        type="button"
                        className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateWorkflowClick(workflow.id);
                        }}
                        aria-label="Generate"
                      >
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
                      </button>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2">
                      {workflowRuns.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                          No researches yet for this workflow.
                        </div>
                      ) : (
                        <RunTable
                          runs={workflowRuns}
                          hideHeader={true}
                          dateColumn="updated"
                        />
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </TooltipProvider>
      ) : (
        <RunTable runs={filteredAndSortedRuns} dateColumn="updated" />
      )}
    </div>
  );
}

