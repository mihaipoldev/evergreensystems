import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queries";
import type { Testimonial } from "@/features/testimonials/types";

async function fetchTestimonials(filters?: { approved?: boolean; search?: string }): Promise<Testimonial[]> {
  const params = new URLSearchParams();
  if (filters?.approved !== undefined) params.append("approved", String(filters.approved));
  if (filters?.search) params.append("search", filters.search);
  
  const url = `/api/admin/testimonials${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch testimonials");
  }
  return response.json();
}

export function useTestimonials(
  filters?: { approved?: boolean; search?: string },
  options?: Omit<UseQueryOptions<Testimonial[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.testimonials.list(filters),
    queryFn: () => fetchTestimonials(filters),
    ...options,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      author_name: string;
      author_role?: string;
      company_name?: string;
      headline?: string;
      quote?: string;
      avatar_url?: string;
      rating?: number;
      approved?: boolean;
      position?: number;
    }) => {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create testimonial");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Testimonial> }) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update testimonial");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.detail(variables.id) });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete testimonial");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all });
    },
  });
}
