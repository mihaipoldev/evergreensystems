"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { CTAButtonsList } from "@/features/page-builder/cta/components/CTAButtonsList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function CTAPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="CTA Buttons"
          description="Manage your call-to-action buttons."
          variant="list"
        />
      }
    >
      <CTAButtonsList initialCTAButtons={[]} />
    </Suspense>
  );
}
