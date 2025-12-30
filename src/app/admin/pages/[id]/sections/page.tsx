import { getPageById } from "@/features/page-builder/pages/queries";
import { getSectionsByPageId } from "@/features/page-builder/sections/queries";
import { getSiteStructureByPageId } from "@/features/page-builder/site-structure/queries";
import { PageContentTabs } from "@/features/page-builder/pages/components/PageContentTabs";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { PageStatusHeader } from "@/features/page-builder/pages/components/PageStatusHeader";
import { notFound } from "next/navigation";
import type { Section } from "@/features/page-builder/sections/types";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

type PageSection = Section & {
  page_section_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
};

export default async function PageSectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const page = await getPageById(id);
  if (!page) {
    notFound();
  }

  const sections = await getSectionsByPageId(id);
  const siteStructureInfo = await getSiteStructureByPageId(id);
  
  // Transform sections to include page_section metadata
  const pageSections: PageSection[] = sections.map((section: any) => ({
    ...section,
    page_section_id: section.page_section_id || "",
    position: section.position ?? 0,
    status: section.status || "draft",
  }));

  const pageStatus = (page.status || "draft") as "published" | "draft" | "deactivated";

  // Create badges for site structure
  const siteStructureBadges = siteStructureInfo.map((info) => {
    if (info.environment === 'both') {
      return (
        <div key={info.page_type} className="flex items-center gap-1">
          <Badge variant="destructive" className="text-xs font-semibold">
            Production
          </Badge>
          <Badge className="text-xs font-semibold bg-primary text-primary-foreground border-transparent">
            Development
          </Badge>
        </div>
      );
    } else if (info.environment === 'production') {
      return (
        <Badge key={info.page_type} variant="destructive" className="text-xs font-semibold">
          Production
        </Badge>
      );
    } else {
      return (
        <Badge key={info.page_type} className="text-xs font-semibold bg-primary text-primary-foreground border-transparent">
          Development
        </Badge>
      );
    }
  });

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title={
            <div className="flex items-baseline gap-3">
              <span>{page.title}</span>
              {siteStructureBadges.length > 0 && (
                <div className="flex items-end gap-2">
                  {siteStructureBadges}
                </div>
              )}
            </div>
          }
          rightSideContent={
            <PageStatusHeader
              pageId={page.id}
              initialStatus={pageStatus}
            />
          }
        />
      </div>
      <PageContentTabs
        page={page}
        initialSections={pageSections}
      />
    </div>
  );
}
