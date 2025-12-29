import { SiteStructurePageClient } from "@/features/page-builder/site-structure/components/SiteStructurePageClient";
import { getPagesByType, getSiteStructureWithPages } from "@/features/page-builder/site-structure/data";
import { getAllPages } from "@/features/page-builder/pages/data";

export const dynamic = 'force-dynamic';

export default async function SiteStructurePage() {
  const pagesByType = await getPagesByType();
  const siteStructure = await getSiteStructureWithPages();
  const allPages = await getAllPages();

  return (
    <SiteStructurePageClient 
      pagesByType={pagesByType} 
      siteStructure={siteStructure} 
      allPages={allPages}
    />
  );
}
