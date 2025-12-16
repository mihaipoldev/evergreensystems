import { SiteStructurePageClient } from "@/features/site-structure/components/SiteStructurePageClient";
import { getPagesByType, getSiteStructureWithPages } from "@/features/site-structure/data";
import { getAllPages } from "@/features/pages/data";

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
