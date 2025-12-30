"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { PagesList } from "@/features/page-builder/pages/components/PagesList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function PagesPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Pages"
          description="Manage your pages."
          variant="list"
        />
      }
    >
      <PagesList initialPages={[]} />
    </Suspense>
  );
}
