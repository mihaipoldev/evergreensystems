"use client";

import { useEffect, useState } from "react";
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
  dashboard: "Dashboard",
  "site-preferences": "Site Preferences",
  sections: "Sections",
  features: "Features",
  testimonials: "Testimonials",
  faq: "FAQ",
  media: "Media Library",
  settings: "Settings",
};

async function fetchItemName(resource: string, slug: string): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/admin/item-name?resource=${encodeURIComponent(resource)}&slug=${encodeURIComponent(slug)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.error(`Error fetching ${resource} name:`, error);
    return null;
  }
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const [pageName, setPageName] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [itemName, setItemName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse the pathname
  const segments = pathname.split("/").filter(Boolean);

  // Remove "admin" from segments if present
  const adminIndex = segments.indexOf("admin");
  const relevantSegments = adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments;

  // Check for new nested structure: /admin/pages/[id]/sections/[sectionId]/...
  const isPagesRoute = relevantSegments[0] === "pages" && relevantSegments.length >= 2;
  const pageId = isPagesRoute ? relevantSegments[1] : null;
  const isSectionsRoute = isPagesRoute && relevantSegments[2] === "sections" && relevantSegments.length >= 4;
  const sectionId = isSectionsRoute ? relevantSegments[3] : null;
  const isSectionEditRoute = isSectionsRoute && relevantSegments[4] === "edit";
  const isMediaRoute = isSectionsRoute && relevantSegments[4] === "media";
  const isCTARoute = isSectionsRoute && relevantSegments[4] === "cta";

  // Check for old routes
  const isOldEditPage = !isPagesRoute && relevantSegments.length >= 3 && relevantSegments[2] === "edit";
  const isOldStatsPage = !isPagesRoute && relevantSegments.length >= 3 && relevantSegments[2] === "stats";
  const resource = !isPagesRoute ? (relevantSegments[0] || null) : null;
  const itemSlug = (isOldEditPage || isOldStatsPage) ? relevantSegments[1] : null;

  // Fetch names for nested routes
  useEffect(() => {
    if (isPagesRoute && pageId) {
      setIsLoading(true);
      Promise.all([
        pageId ? fetchItemName("pages", pageId) : Promise.resolve(null),
        sectionId ? fetchItemName("sections", sectionId) : Promise.resolve(null),
      ]).then(([page, section]) => {
        setPageName(page);
        setSectionName(section);
        setItemName(null);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else if ((isOldEditPage || isOldStatsPage) && resource && itemSlug) {
      setIsLoading(true);
      fetchItemName(resource, itemSlug)
        .then((name) => {
          setItemName(name);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setPageName(null);
      setSectionName(null);
      setItemName(null);
    }
  }, [isPagesRoute, pageId, sectionId, isOldEditPage, isOldStatsPage, resource, itemSlug]);

  // Handle dashboard page
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

  // Handle new nested structure: /admin/pages/[id]/sections/[sectionId]/...
  if (isPagesRoute && pageId) {
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
            {isSectionsRoute ? (
              <BreadcrumbLink asChild>
                <Link href={`/admin/pages/${pageId}/sections`}>
                  {isLoading ? "Loading..." : pageName || "Page"}
                </Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{isLoading ? "Loading..." : pageName || "Page"}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
              {isSectionsRoute && sectionId && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isSectionEditRoute || isMediaRoute || isCTARoute ? (
                      <BreadcrumbLink asChild>
                        <Link href={`/admin/pages/${pageId}/sections/${sectionId}?tab=edit`}>
                          {isLoading ? "Loading..." : sectionName || "Section"}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{isLoading ? "Loading..." : sectionName || "Section"}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {isSectionEditRoute && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Edit</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
              {isMediaRoute && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Media</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {isCTARoute && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>CTA</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Handle old routes
  const oldPageName = pageNames[resource || ""] || (resource ? resource.charAt(0).toUpperCase() + resource.slice(1) : "");

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
          {isOldEditPage || isOldStatsPage ? (
            <BreadcrumbLink asChild>
              <Link href={`/admin/${resource}`}>{oldPageName}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{oldPageName}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {isOldEditPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isLoading ? "Loading..." : itemName || "Edit"}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
        {isOldStatsPage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/admin/${resource}/${itemSlug}/edit`}>
                  {isLoading ? "Loading..." : itemName || "Item"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Stats</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
