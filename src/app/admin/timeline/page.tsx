"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { TimelineList } from "@/features/page-builder/timeline/components/TimelineList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function TimelinePage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Timeline"
          description="Manage your timeline items."
          variant="list"
        />
      }
    >
      <TimelineList initialTimelineItems={[]} />
    </Suspense>
  );
}
