"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { FAQList } from "@/features/page-builder/faq/components/FAQList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function FAQPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="FAQ"
          description="Manage your FAQ items."
          variant="list"
        />
      }
    >
      <FAQList initialFAQItems={[]} />
    </Suspense>
  );
}
