import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queries";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
  created_at: string;
  updated_at: string;
};

async function fetchFAQItems(search?: string): Promise<FAQItem[]> {
  const url = search
    ? `/api/admin/faq-items?search=${encodeURIComponent(search)}`
    : "/api/admin/faq-items";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch FAQ items");
  }
  return response.json();
}

export function useFAQItems(search?: string) {
  return useQuery({
    queryKey: queryKeys.faqItems.list({ search }),
    queryFn: () => fetchFAQItems(search),
  });
}

export function useCreateFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { question: string; answer: string; position?: number }) => {
      const response = await fetch("/api/admin/faq-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create FAQ item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqItems.all });
    },
  });
}

export function useUpdateFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FAQItem> }) => {
      const response = await fetch(`/api/admin/faq-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update FAQ item");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqItems.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.faqItems.detail(variables.id) });
    },
  });
}

export function useDeleteFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/faq-items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete FAQ item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqItems.all });
    },
  });
}

export function useDuplicateFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sectionId }: { id: string; sectionId?: string }) => {
      const url = sectionId
        ? `/api/admin/faq-items/${id}/duplicate?section_id=${sectionId}`
        : `/api/admin/faq-items/${id}/duplicate`;
      const response = await fetch(url, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate FAQ item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqItems.all });
    },
  });
}

