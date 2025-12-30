"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { TestimonialsList } from "@/features/page-builder/testimonials/components/TestimonialsList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function TestimonialsPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Testimonials"
          description="Manage your testimonials."
          variant="list"
        />
      }
    >
      <TestimonialsList initialTestimonials={[]} />
    </Suspense>
  );
}
