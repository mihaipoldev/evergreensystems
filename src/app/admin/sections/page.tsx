"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { SectionsList } from "@/features/page-builder/sections/components/SectionsList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function SectionsPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Sections"
          description="Manage your sections."
          variant="list"
        />
      }
    >
      <SectionsList initialSections={[]} />
    </Suspense>
  );
}
