import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queries";
import type { Media } from "@/features/media/types";

async function fetchMedia(search?: string): Promise<Media[]> {
  const url = search
    ? `/api/admin/media?search=${encodeURIComponent(search)}`
    : "/api/admin/media";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch media");
  }
  return response.json();
}

export function useMedia(
  search?: string,
  options?: Omit<UseQueryOptions<Media[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.media.list({ search }),
    queryFn: () => fetchMedia(search),
    ...options,
  });
}

export function useCreateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      source_type: string;
      url?: string;
      embed_id?: string;
      name?: string;
      thumbnail_url?: string;
      duration?: number;
    }) => {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create media");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Media> }) => {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update media");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(variables.id) });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete media");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}
