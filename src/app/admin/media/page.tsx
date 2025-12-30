"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { MediaLibrary } from "@/features/page-builder/media/components/MediaLibrary";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function MediaPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Media"
          description="Manage your media library."
          variant="list"
        />
      }
    >
      <MediaLibrary initialMedia={[]} />
    </Suspense>
  );
}
