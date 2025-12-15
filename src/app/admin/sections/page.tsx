import { getAllSections } from "@/features/sections/data";
import { SectionsList } from "@/features/sections/components/SectionsList";

export const dynamic = 'force-dynamic';

export default async function SectionsPage() {
  const sections = await getAllSections();

  return <SectionsList initialSections={sections || []} />;
}
