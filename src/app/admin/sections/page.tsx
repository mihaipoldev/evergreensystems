import { getAllSections } from "@/features/page-builder/sections/data";
import { SectionsList } from "@/features/page-builder/sections/components/SectionsList";

export const dynamic = 'force-dynamic';

export default async function SectionsPage() {
  const sections = await getAllSections();

  return <SectionsList initialSections={sections || []} />;
}
