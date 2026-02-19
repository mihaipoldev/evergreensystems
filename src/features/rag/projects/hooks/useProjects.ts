"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project } from "../types";

type ProjectWithCount = Project & { document_count?: number };

export function projectsQueryKey(projectTypeId: string | null) {
  return ["projects", { projectTypeId }] as const;
}

async function fetchProjects(projectTypeId: string | null): Promise<ProjectWithCount[]> {
  const apiUrl = projectTypeId
    ? `/api/intel/projects?project_type_id=${encodeURIComponent(projectTypeId)}`
    : "/api/intel/projects";

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
}

/**
 * Shared hook for fetching projects. Caches for 30 seconds so
 * navigating away and back is instant.
 */
export function useProjects(projectTypeId: string | null) {
  return useQuery({
    queryKey: projectsQueryKey(projectTypeId),
    queryFn: () => fetchProjects(projectTypeId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Prefetch projects into the React Query cache.
 * Call this on hover to warm the cache before navigation.
 */
export function usePrefetchProjects() {
  const queryClient = useQueryClient();
  return (projectTypeId: string | null) => {
    queryClient.prefetchQuery({
      queryKey: projectsQueryKey(projectTypeId),
      queryFn: () => fetchProjects(projectTypeId),
      staleTime: 30 * 1000,
    });
  };
}
