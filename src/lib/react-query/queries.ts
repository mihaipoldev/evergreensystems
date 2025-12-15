/**
 * Query key factories for React Query
 * Centralized query keys for consistent cache invalidation
 */

export const queryKeys = {
  // Pages
  pages: {
    all: ["pages"] as const,
    lists: () => [...queryKeys.pages.all, "list"] as const,
    list: (filters?: { search?: string }) => [...queryKeys.pages.lists(), filters] as const,
    details: () => [...queryKeys.pages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.pages.details(), id] as const,
  },

  // Sections
  sections: {
    all: ["sections"] as const,
    lists: () => [...queryKeys.sections.all, "list"] as const,
    list: (filters?: { pageId?: string; search?: string }) => [...queryKeys.sections.lists(), filters] as const,
    details: () => [...queryKeys.sections.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.sections.details(), id] as const,
  },

  // Media
  media: {
    all: ["media"] as const,
    lists: () => [...queryKeys.media.all, "list"] as const,
    list: (filters?: { search?: string }) => [...queryKeys.media.lists(), filters] as const,
    details: () => [...queryKeys.media.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
  },

  // Testimonials
  testimonials: {
    all: ["testimonials"] as const,
    lists: () => [...queryKeys.testimonials.all, "list"] as const,
    list: (filters?: { status?: string; search?: string }) => [...queryKeys.testimonials.lists(), filters] as const,
    details: () => [...queryKeys.testimonials.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.testimonials.details(), id] as const,
  },

  // FAQ Items
  faqItems: {
    all: ["faqItems"] as const,
    lists: () => [...queryKeys.faqItems.all, "list"] as const,
    list: (filters?: { search?: string }) => [...queryKeys.faqItems.lists(), filters] as const,
    details: () => [...queryKeys.faqItems.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.faqItems.details(), id] as const,
  },

  // CTA Buttons
  ctaButtons: {
    all: ["ctaButtons"] as const,
    lists: () => [...queryKeys.ctaButtons.all, "list"] as const,
    list: (filters?: { search?: string }) => [...queryKeys.ctaButtons.lists(), filters] as const,
    details: () => [...queryKeys.ctaButtons.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.ctaButtons.details(), id] as const,
  },

  // Timeline
  timeline: {
    all: ["timeline"] as const,
    lists: () => [...queryKeys.timeline.all, "list"] as const,
    list: () => [...queryKeys.timeline.lists()] as const,
    details: () => [...queryKeys.timeline.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.timeline.details(), id] as const,
  },

  // Results
  results: {
    all: ["results"] as const,
    lists: () => [...queryKeys.results.all, "list"] as const,
    list: () => [...queryKeys.results.lists()] as const,
    details: () => [...queryKeys.results.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.results.details(), id] as const,
  },
} as const;
