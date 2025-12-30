"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { FeaturesList } from "@/features/page-builder/features/components/FeaturesList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function FeaturesPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Features"
          description="Manage your features."
          variant="list"
        />
      }
    >
      <FeaturesList initialFeatures={[]} />
    </Suspense>
  );
}
