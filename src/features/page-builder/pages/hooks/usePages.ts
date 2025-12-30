import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queries";
import type { Page } from "../types";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

async function fetchPages(search?: string): Promise<Page[]> {
  const fetchStartTime = getTimestamp();
  const url = search
    ? `/api/admin/pages?search=${encodeURIComponent(search)}`
    : "/api/admin/pages";
  
  const networkStartTime = getTimestamp();
  const response = await fetch(url);
  const networkDuration = getDuration(networkStartTime);
  debugClientTiming("usePages", "Network request", networkDuration, { 
    url,
    status: response.status,
    ok: response.ok 
  });
  
  if (!response.ok) {
    const totalDuration = getDuration(fetchStartTime);
    debugClientTiming("usePages", "Total (ERROR)", totalDuration, { status: response.status });
    throw new Error("Failed to fetch pages");
  }
  
  const parseStartTime = getTimestamp();
  const data = await response.json();
  const parseDuration = getDuration(parseStartTime);
  debugClientTiming("usePages", "Response parsing", parseDuration, { dataLength: data?.length || 0 });
  
  const totalDuration = getDuration(fetchStartTime);
  debugClientTiming("usePages", "Total", totalDuration, { 
    pageCount: data?.length || 0,
    hasSearch: !!search 
  });
  
  return data;
}

export function usePages(
  search?: string,
  options?: Omit<UseQueryOptions<Page[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.pages.list({ search }),
    queryFn: () => fetchPages(search),
    ...options,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; type: string }) => {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create page");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Page> }) => {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update page");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.detail(variables.id) });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete page");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
    },
  });
}

export function useDuplicatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/pages/${id}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate page");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
    },
  });
}

