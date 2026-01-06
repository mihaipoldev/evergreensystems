"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { RunTable } from "@/features/rag/runs/components/RunTable";
import { Toolbar, type ViewMode } from "@/features/rag/shared/components/Toolbar";
import { useViewMode } from "@/features/rag/shared/hooks/useViewMode";
import type { FilterCategory } from "@/features/rag/shared/components/RAGFilterMenu";
import { createClient } from "@/lib/supabase/client";
import type { Run } from "@/features/rag/runs/types";

type RunWithExtras = Run & { 
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
};

type ResearchRunsClientProps = {
  initialRuns: RunWithExtras[];
  researchSubjectId: string;
};

export function ResearchRunsClient({
  initialRuns,
  researchSubjectId,
}: ResearchRunsClientProps) {
  const [runs, setRuns] = useState<RunWithExtras[]>(initialRuns);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useViewMode("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    "Run Type": [],
    "Status": [],
  });
  const [selectedSort, setSelectedSort] = useState<string>("Recent");

  // Update runs when initialRuns changes (from server refresh)
  useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

  // Set up Supabase real-time subscription for runs
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up runs subscription for research subject:', researchSubjectId);
    
    // Channel for rag_runs table
    const runsChannel = supabase
      .channel(`rag_runs_research_${researchSubjectId}`, {
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
          filter: `subject_id=eq.${researchSubjectId}`,
        },
        async (payload) => {
          console.log('🏃 Run change detected for research subject:', {
            researchSubjectId,
            eventType: payload.eventType,
            runId: (payload.new as any)?.id || (payload.old as any)?.id,
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newRun = payload.new as any;
            
            // Fetch the run with its knowledge base and workflow
            const { data: runData } = await supabase
              .from('rag_runs')
              .select(`
                *,
                rag_knowledge_bases (name),
                workflows (name, label)
              `)
              .eq('id', newRun.id)
              .single();
            
            if (runData) {
              const kbName = (runData as any).rag_knowledge_bases?.name || null;
              const workflowName = (runData as any).workflows?.name || null;
              const workflowLabel = (runData as any).workflows?.label || null;
              const newRunWithExtras: RunWithExtras = {
                ...(runData as Run),
                knowledge_base_name: kbName,
                workflow_name: workflowName,
                workflow_label: workflowLabel,
              };

              setRuns((prev) => {
                const exists = prev.some((run) => run.id === newRun.id);
                if (exists) {
                  return prev;
                }
                
                const updated = [newRunWithExtras, ...prev];
                return updated.sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
              });
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedRun = payload.new as any;
            
            // Fetch updated KB and workflow info
            const { data: runData } = await supabase
              .from('rag_runs')
              .select(`
                *,
                rag_knowledge_bases (name),
                workflows (name, label)
              `)
              .eq('id', updatedRun.id)
              .single();
            
            if (runData) {
              const kbName = (runData as any).rag_knowledge_bases?.name || null;
              const workflowName = (runData as any).workflows?.name || null;
              const workflowLabel = (runData as any).workflows?.label || null;
              
              setRuns((prev) => {
                return prev.map((run) =>
                  run.id === updatedRun.id
                    ? {
                        ...updatedRun,
                        knowledge_base_name: kbName,
                        workflow_name: workflowName,
                        workflow_label: workflowLabel,
                      }
                    : run
                );
              });
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
        console.log('📡 Runs subscription status for research subject:', researchSubjectId, status);
      });

    return () => {
      console.log('🧹 Cleaning up runs subscription for research subject:', researchSubjectId);
      supabase.removeChannel(runsChannel);
    };
  }, [researchSubjectId, initialRuns]);

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

  const filteredAndSortedRuns = useMemo(() => {
    let filtered = runs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (run) =>
          run.knowledge_base_name?.toLowerCase().includes(query) ||
          run.run_type.toLowerCase().includes(query) ||
          run.status.toLowerCase().includes(query) ||
          run.workflow_label?.toLowerCase().includes(query) ||
          run.workflow_name?.toLowerCase().includes(query)
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
            ? "No runs found for this research subject."
            : "No runs found matching your search"}
        </motion.div>
      ) : (
        <RunTable runs={filteredAndSortedRuns} />
      )}
    </div>
  );
}

