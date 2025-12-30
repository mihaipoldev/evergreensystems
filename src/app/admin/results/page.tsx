"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { ResultsList } from "@/features/page-builder/results/components/ResultsList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Results"
          description="Manage your results."
          variant="list"
        />
      }
    >
      <ResultsList initialResults={[]} />
    </Suspense>
  );
}
