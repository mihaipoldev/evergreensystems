"use client";

import { useQuery } from "@tanstack/react-query";

type Workflow = { id: string; slug: string; name: string };

export const WORKFLOWS_QUERY_KEY = ["workflows"] as const;

async function fetchWorkflows(): Promise<Workflow[]> {
  const response = await fetch("/api/intel/workflows?enabled=true");
  if (!response.ok) {
    throw new Error("Failed to fetch workflows");
  }
  return response.json();
}

/**
 * Shared hook for enabled workflows. Used by RunList's filter dropdown.
 * Workflows rarely change so we cache for 5 minutes.
 */
export function useWorkflows() {
  return useQuery({
    queryKey: WORKFLOWS_QUERY_KEY,
    queryFn: fetchWorkflows,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
