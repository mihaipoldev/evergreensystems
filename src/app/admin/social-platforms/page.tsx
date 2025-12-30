"use client";

import { Suspense } from "react";

// Force dynamic rendering - page is client-side only, no server data fetching
export const dynamic = 'force-dynamic';
import { SocialPlatformsList } from "@/features/page-builder/social-platforms/components/SocialPlatformsList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";

export default function SocialPlatformsPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton
          title="Social Platforms"
          description="Manage your social platforms."
          variant="list"
        />
      }
    >
      <SocialPlatformsList initialSocialPlatforms={[]} />
    </Suspense>
  );
}
