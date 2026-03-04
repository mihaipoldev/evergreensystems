"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map route segments to display names
const pageNames: Record<string, string> = {
  analytics: "Analytics",
  media: "Media Library",
  settings: "Settings",
  "website-settings": "Website Settings",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();

  // Parse the pathname
  const segments = pathname.split("/").filter(Boolean);

  // Remove "admin" from segments if present
  const adminIndex = segments.indexOf("admin");
  const relevantSegments = adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments;

  // Handle dashboard/root page
  if (!relevantSegments.length || relevantSegments[0] === "") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/analytics">Menu</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const topLevel = relevantSegments[0];
  const topLevelName = pageNames[topLevel] || topLevel.charAt(0).toUpperCase() + topLevel.slice(1);
  const hasSubRoute = relevantSegments.length > 1;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin/analytics">Menu</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {hasSubRoute ? (
            <BreadcrumbLink asChild>
              <Link href={`/admin/${topLevel}`}>{topLevelName}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{topLevelName}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {hasSubRoute && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {relevantSegments.slice(1).join(" / ")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
