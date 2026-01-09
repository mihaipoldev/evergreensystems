"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Run } from "@/features/rag/runs/types";

type RunWithKB = Run & {
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
  project_name?: string | null;
  report_id?: string | null;
};

// Processing statuses: runs that are currently active/processing
const PROCESSING_STATUSES: string[] = ["queued", "processing"];

/**
 * Hook to fetch and subscribe to processing runs via Supabase realtime
 * Only returns runs with processing statuses (queued, collecting, ingesting, generating)
 */
export function useProcessingRuns() {
  const [runs, setRuns] = useState<RunWithKB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let pollInterval: NodeJS.Timeout | null = null;

    // Function to fetch processing runs
    const fetchProcessingRuns = async () => {
      try {
        // Get auth token for API call
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        // Filter server-side by processing statuses
        const statusParam = PROCESSING_STATUSES.join(",");
        const response = await fetch(`/api/intel/runs?status=${statusParam}`, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Data is already filtered server-side, no need for client-side filtering
          setRuns(data || []);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchProcessingRuns();

    // Set up polling as fallback (every 30 seconds - subscription handles real-time updates)
    pollInterval = setInterval(fetchProcessingRuns, 30000);

    // Set up Supabase realtime subscription
    const channel = supabase
      .channel("rag_runs_processing_changes", {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rag_runs",
        },
        async (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const newRun = payload.new as any;
            // Only process if it's a processing status
            if (PROCESSING_STATUSES.includes(newRun.status)) {
              try {
                const { data: sessionData } = await supabase.auth.getSession();
                const accessToken = sessionData?.session?.access_token;
                
                const response = await fetch(`/api/intel/runs/${newRun.id}`, {
                  headers: {
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                  },
                });
                if (response.ok) {
                  const runData = await response.json();
                  setRuns((prev) => {
                    const exists = prev.some((run) => run.id === newRun.id);
                    if (exists) return prev;
                    return [runData, ...prev].sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                  });
                } else {
                  // Fallback: refresh the entire list
                  fetchProcessingRuns();
                }
              } catch (error) {
                fetchProcessingRuns();
              }
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const updatedRun = payload.new as any;
            const isProcessing = PROCESSING_STATUSES.includes(updatedRun.status);

            try {
              const { data: sessionData } = await supabase.auth.getSession();
              const accessToken = sessionData?.session?.access_token;
              
              const response = await fetch(`/api/intel/runs/${updatedRun.id}`, {
                headers: {
                  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
              });
              if (response.ok) {
                const runData = await response.json();
                setRuns((prev) => {
                  // If status changed to non-processing, remove it
                  if (!isProcessing) {
                    return prev.filter((run) => run.id !== updatedRun.id);
                  }
                  // Otherwise update it
                  return prev.map((run) =>
                    run.id === updatedRun.id ? runData : run
                  );
                });
              } else {
                // Fallback: refresh the entire list
                fetchProcessingRuns();
              }
            } catch (error) {
              fetchProcessingRuns();
            }
          } else if (payload.eventType === "DELETE" && payload.old) {
            const deletedRun = payload.old as any;
            setRuns((prev) => prev.filter((run) => run.id !== deletedRun.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      supabase.removeChannel(channel);
    };
  }, []);

  return { runs, isLoading };
}

