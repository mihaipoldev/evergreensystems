"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Run } from "../types";

type RunWithKB = Run & { knowledge_base_name?: string | null };

export function runsQueryKey(projectTypeId: string | null) {
  return ["runs", { projectTypeId }] as const;
}

async function fetchRuns(projectTypeId: string | null): Promise<RunWithKB[]> {
  const apiUrl = projectTypeId
    ? `/api/intel/runs?project_type_id=${encodeURIComponent(projectTypeId)}`
    : "/api/intel/runs";

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch runs");
  }
  return response.json();
}

/**
 * Shared hook for fetching runs. Caches for 15 seconds so
 * navigating away and back is instant. RunList's own real-time
 * subscription handles live updates independently.
 */
export function useRuns(projectTypeId: string | null) {
  return useQuery({
    queryKey: runsQueryKey(projectTypeId),
    queryFn: () => fetchRuns(projectTypeId),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 60 * 1000, // 1 minute
  });
}

/**
 * Prefetch runs into the React Query cache.
 * Call on hover over the Research sidebar link.
 */
export function usePrefetchRuns() {
  const queryClient = useQueryClient();
  return (projectTypeId: string | null) => {
    queryClient.prefetchQuery({
      queryKey: runsQueryKey(projectTypeId),
      queryFn: () => fetchRuns(projectTypeId),
      staleTime: 15 * 1000,
    });
  };
}
