"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectType } from "@/features/rag/project-type/types";

export const PROJECT_TYPES_QUERY_KEY = ["project-types"] as const;

async function fetchProjectTypes(): Promise<ProjectType[]> {
  const response = await fetch("/api/intel/project-types?enabled=true");
  if (!response.ok) {
    throw new Error("Failed to fetch project types");
  }
  return response.json();
}

/**
 * Shared hook for project types. Uses React Query for automatic deduplication
 * and caching - multiple components calling this share one network request.
 */
export function useProjectTypes() {
  return useQuery({
    queryKey: PROJECT_TYPES_QUERY_KEY,
    queryFn: fetchProjectTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes - project types rarely change
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Prefetch project types into the React Query cache.
 * Call this on hover to warm the cache before navigation.
 */
export function usePrefetchProjectTypes() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.prefetchQuery({
      queryKey: PROJECT_TYPES_QUERY_KEY,
      queryFn: fetchProjectTypes,
      staleTime: 5 * 60 * 1000,
    });
  };
}
