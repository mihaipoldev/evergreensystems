import { Suspense } from "react";
import { WebsiteSettingsPageClient } from "./WebsiteSettingsPageClient";

export const dynamic = 'force-dynamic';

export default function WebsiteSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      }
    >
      <WebsiteSettingsPageClient />
    </Suspense>
  );
}
