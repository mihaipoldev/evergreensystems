import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queries";
import type { Result } from "@/features/results/types";

async function fetchResults(): Promise<Result[]> {
  const response = await fetch("/api/admin/results");
  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }
  return response.json();
}

export function useResults(
  options?: Omit<UseQueryOptions<Result[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.results.all,
    queryFn: () => fetchResults(),
    ...options,
  });
}

export function useCreateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      content: Record<string, any>;
      position?: number;
    }) => {
      const response = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create result");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.results.all });
    },
  });
}

export function useUpdateResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Result> }) => {
      const response = await fetch(`/api/admin/results/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update result");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.results.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.results.detail(variables.id) });
    },
  });
}

export function useDeleteResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/results/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete result");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.results.all });
    },
  });
}
