import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queries";
import type { Section } from "@/features/sections/types";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

async function fetchSections(filters?: { pageId?: string; search?: string }): Promise<Section[]> {
  const fetchStartTime = getTimestamp();
  const params = new URLSearchParams();
  if (filters?.pageId) params.append("page_id", filters.pageId);
  if (filters?.search) params.append("search", filters.search);
  
  const url = `/api/admin/sections${params.toString() ? `?${params.toString()}` : ""}`;
  console.log("🔍 [fetchSections] Fetching sections:", { filters, url });
  
  const networkStartTime = getTimestamp();
  const response = await fetch(url);
  const networkDuration = getDuration(networkStartTime);
  debugClientTiming("useSections", "Network request", networkDuration, { 
    url,
    status: response.status,
    ok: response.ok,
    pageId: filters?.pageId 
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    const totalDuration = getDuration(fetchStartTime);
    debugClientTiming("useSections", "Total (ERROR)", totalDuration, { 
      status: response.status,
      errorText 
    });
    console.error("❌ [fetchSections] Error response:", { status: response.status, errorText });
    throw new Error("Failed to fetch sections");
  }
  
  const parseStartTime = getTimestamp();
  const data = await response.json();
  const parseDuration = getDuration(parseStartTime);
  debugClientTiming("useSections", "Response parsing", parseDuration, { 
    dataLength: data?.length || 0,
    pageId: filters?.pageId 
  });
  
  const totalDuration = getDuration(fetchStartTime);
  debugClientTiming("useSections", "Total", totalDuration, { 
    sectionCount: data?.length || 0,
    pageId: filters?.pageId,
    hasSearch: !!filters?.search 
  });
  
  console.log("✅ [fetchSections] Received sections:", { 
    count: data.length, 
    sections: data.map((s: any) => ({ id: s.id, title: s.title || s.admin_title || s.type }))
  });
  return data;
}

export function useSections(
  filters?: { pageId?: string; search?: string },
  options?: Omit<UseQueryOptions<Section[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.sections.list(filters),
    queryFn: () => fetchSections(filters),
    ...options,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: string;
      title?: string;
      admin_title?: string;
      subtitle?: string;
      content?: any;
      media_url?: string;
    }) => {
      const response = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create section");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Section> }) => {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update section");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.detail(variables.id) });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/sections/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete section");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
    },
  });
}

export function useDuplicateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/sections/${id}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate section");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sections.all });
    },
  });
}
