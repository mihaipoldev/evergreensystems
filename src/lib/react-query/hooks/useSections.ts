import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queries";
import type { Section } from "@/features/sections/types";

async function fetchSections(filters?: { pageId?: string; search?: string }): Promise<Section[]> {
  const params = new URLSearchParams();
  if (filters?.pageId) params.append("page_id", filters.pageId);
  if (filters?.search) params.append("search", filters.search);
  
  const url = `/api/admin/sections${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch sections");
  }
  return response.json();
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
