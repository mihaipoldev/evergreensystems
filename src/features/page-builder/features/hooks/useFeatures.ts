import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queries";
import type { OfferFeature } from "../types";

async function fetchFeatures(): Promise<OfferFeature[]> {
  const response = await fetch("/api/admin/offer-features");
  if (!response.ok) {
    throw new Error("Failed to fetch features");
  }
  return response.json();
}

export function useFeatures(
  options?: Omit<UseQueryOptions<OfferFeature[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.features?.all || ["features"],
    queryFn: () => fetchFeatures(),
    ...options,
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/offer-features/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete feature");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features?.all || ["features"] });
    },
  });
}

export function useDuplicateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sectionId }: { id: string; sectionId?: string }) => {
      const url = sectionId
        ? `/api/admin/offer-features/${id}/duplicate?section_id=${sectionId}`
        : `/api/admin/offer-features/${id}/duplicate`;
      const response = await fetch(url, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate feature");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features?.all || ["features"] });
    },
  });
}

