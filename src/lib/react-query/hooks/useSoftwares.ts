import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queries";
import type { Software } from "@/features/page-builder/softwares/types";

async function fetchSoftwares(): Promise<Software[]> {
  const response = await fetch("/api/admin/softwares");
  if (!response.ok) {
    throw new Error("Failed to fetch softwares");
  }
  return response.json();
}

export function useSoftwares(
  options?: Omit<UseQueryOptions<Software[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.softwares?.all || ["softwares"],
    queryFn: () => fetchSoftwares(),
    ...options,
  });
}

export function useDeleteSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/softwares/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete software");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.softwares?.all || ["softwares"] });
    },
  });
}

export function useDuplicateSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sectionId }: { id: string; sectionId?: string }) => {
      const url = sectionId
        ? `/api/admin/softwares/${id}/duplicate?section_id=${sectionId}`
        : `/api/admin/softwares/${id}/duplicate`;
      const response = await fetch(url, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate software");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.softwares?.all || ["softwares"] });
    },
  });
}
