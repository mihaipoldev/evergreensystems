import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queries";
import type { SocialPlatform } from "../types";

async function fetchSocialPlatforms(search?: string): Promise<SocialPlatform[]> {
  const url = search
    ? `/api/admin/social-platforms?search=${encodeURIComponent(search)}`
    : "/api/admin/social-platforms";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch social platforms");
  }
  return response.json();
}

export function useSocialPlatforms(
  search?: string,
  options?: Omit<UseQueryOptions<SocialPlatform[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.socialPlatforms?.list({ search }) || ["social-platforms", { search }],
    queryFn: () => fetchSocialPlatforms(search),
    ...options,
  });
}

export function useDeleteSocialPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/social-platforms/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete social platform");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socialPlatforms?.all || ["social-platforms"] });
    },
  });
}

export function useDuplicateSocialPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sectionId }: { id: string; sectionId?: string }) => {
      const url = sectionId
        ? `/api/admin/social-platforms/${id}/duplicate?section_id=${sectionId}`
        : `/api/admin/social-platforms/${id}/duplicate`;
      const response = await fetch(url, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate social platform");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.socialPlatforms?.all || ["social-platforms"] });
    },
  });
}

