"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageTitle } from "./AdminPageTitle";
import type { ReactNode } from "react";

type PageSkeletonProps = {
  title: string;
  description?: string | ReactNode;
  rightSideContent?: ReactNode;
  variant?: "analytics" | "list" | "default";
};

export function PageSkeleton({
  title,
  description,
  rightSideContent,
  variant = "default",
}: PageSkeletonProps) {
  return (
    <>
      <AdminPageTitle
        title={title}
        description={description}
        rightSideContent={rightSideContent}
      />

      {variant === "analytics" && (
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <div className="rounded-xl overflow-hidden text-card-foreground dark:bg-card bg-card shadow-lg">
            <div className="w-full">
              {/* Tabs skeleton */}
              <div className="flex flex-row md:grid md:grid-cols-5 w-full bg-transparent p-0 gap-0 h-auto min-h-[88px] rounded-none border-b">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center p-4 border-r border-border/30 last:border-r-0"
                  >
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
              {/* Content skeleton */}
              <div className="w-full min-w-0 pr-2 md:pr-6 pl-2 pt-6 md:pt-10 pb-4 md:pb-6 space-y-6">
                <Skeleton className="h-64 w-full" />
                <div className="pt-4 space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {variant === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {variant === "default" && (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      )}
    </>
  );
}

