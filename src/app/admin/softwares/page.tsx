"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { SoftwaresList } from "@/features/page-builder/softwares/components/SoftwaresList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function SoftwaresPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Softwares"
          description="Manage your softwares."
          variant="list"
        />
      }
    >
      <SoftwaresList initialSoftwares={[]} />
    </Suspense>
  );
}
