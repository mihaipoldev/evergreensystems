import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queries";
import type { Timeline } from "@/features/timeline/types";

async function fetchTimelineItems(): Promise<Timeline[]> {
  const response = await fetch("/api/admin/timeline");
  if (!response.ok) {
    throw new Error("Failed to fetch timeline items");
  }
  return response.json();
}

export function useTimelineItems(
  options?: Omit<UseQueryOptions<Timeline[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.timeline.all,
    queryFn: () => fetchTimelineItems(),
    ...options,
  });
}

export function useCreateTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      step: number;
      title: string;
      subtitle?: string;
      badge?: string;
      icon?: string;
      position?: number;
    }) => {
      const response = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create timeline item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}

export function useUpdateTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Timeline> }) => {
      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update timeline item");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.detail(variables.id) });
    },
  });
}

export function useDeleteTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete timeline item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}

export function useDuplicateTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sectionId }: { id: string; sectionId?: string }) => {
      const url = sectionId
        ? `/api/admin/timeline/${id}/duplicate?section_id=${sectionId}`
        : `/api/admin/timeline/${id}/duplicate`;
      const response = await fetch(url, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate timeline item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
    },
  });
}
