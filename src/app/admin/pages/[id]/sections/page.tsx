import { getPageById } from "@/features/pages/data";
import { getSectionsByPageId } from "@/lib/supabase/queries";
import { PageContentTabs } from "@/components/admin/PageContentTabs";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { PageStatusHeader } from "@/components/admin/PageStatusHeader";
import { notFound } from "next/navigation";
import type { Section } from "@/features/sections/types";

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
  
  // Transform sections to include page_section metadata
  const pageSections: PageSection[] = sections.map((section: any) => ({
    ...section,
    page_section_id: section.page_section_id || "",
    position: section.position ?? 0,
    status: section.status || "draft",
  }));

  const pageStatus = (page.status || "draft") as "published" | "draft" | "deactivated";

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title={page.title}
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
