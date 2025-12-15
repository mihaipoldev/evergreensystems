import { notFound, redirect } from "next/navigation";
import { getFirstPageIdBySectionId } from "@/lib/supabase/queries";
import { getSectionById } from "@/features/sections/data";

type SectionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { id } = await params;
  
  // Get the first page ID that contains this section
  const pageId = await getFirstPageIdBySectionId(id);
  
  if (!pageId) {
    notFound();
  }

  // Get section to determine default tab
  const section = await getSectionById(id);
  if (!section) {
    notFound();
  }

  // Determine default tab based on section type
  const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "cta"];
  const isHeroSection = section.type === "hero";
  const isHeaderSection = section.type === "header";
  const isStoriesSection = section.type === "stories";
  const isContentSection = CONTENT_SECTION_TYPES.includes(section.type);

  let defaultTab = "edit";
  if (isHeroSection) {
    defaultTab = "media";
  } else if (isHeaderSection) {
    defaultTab = "cta";
  } else if (isStoriesSection) {
    defaultTab = "media";
  } else if (isContentSection) {
    defaultTab = "items";
  }

  // Redirect to new URL structure with query param
  redirect(`/admin/pages/${pageId}/sections/${id}?tab=${defaultTab}`);
}
