import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queries";

type CTAButton = {
  id: string;
  label: string;
  url: string;
  subtitle?: string | null;
  style?: string;
  icon?: string;
  position: number;
  status: string;
  created_at: string;
  updated_at: string;
};

async function fetchCTAButtons(search?: string): Promise<CTAButton[]> {
  const url = search
    ? `/api/admin/cta-buttons?search=${encodeURIComponent(search)}`
    : "/api/admin/cta-buttons";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch CTA buttons");
  }
  return response.json();
}

export function useCTAButtons(search?: string) {
  return useQuery({
    queryKey: queryKeys.ctaButtons.list({ search }),
    queryFn: () => fetchCTAButtons(search),
  });
}

export function useCreateCTAButton() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      label: string;
      url: string;
      subtitle?: string | null;
      style?: string;
      icon?: string;
      position?: number;
      status?: string;
    }) => {
      const response = await fetch("/api/admin/cta-buttons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create CTA button");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ctaButtons.all });
    },
  });
}

export function useUpdateCTAButton() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CTAButton> }) => {
      const response = await fetch(`/api/admin/cta-buttons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update CTA button");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ctaButtons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ctaButtons.detail(variables.id) });
    },
  });
}

export function useDeleteCTAButton() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/cta-buttons/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete CTA button");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ctaButtons.all });
    },
  });
}

export function useDuplicateCTAButton() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sectionId }: { id: string; sectionId?: string }) => {
      const url = sectionId
        ? `/api/admin/cta-buttons/${id}/duplicate?section_id=${sectionId}`
        : `/api/admin/cta-buttons/${id}/duplicate`;
      const response = await fetch(url, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate CTA button");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ctaButtons.all });
    },
  });
}

