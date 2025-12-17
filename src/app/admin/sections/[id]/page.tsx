import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { SectionContentTabs } from "@/components/admin/SectionContentTabs";
import { SectionStatusHeader } from "@/components/admin/SectionStatusHeader";
import { getSectionById } from "@/features/sections/data";
import { getFeaturesBySectionId, getTestimonialsBySectionId, getFAQItemsBySectionId, getTimelineBySectionId, getResultsBySectionId, getCTAButtonsBySectionId, getPageSectionStatus, getSoftwaresBySectionId, getSocialPlatformsBySectionId, getFirstPageIdBySectionId } from "@/lib/supabase/queries";

type SectionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pageId?: string; tab?: string }>;
};

// Section types that have associated content items
const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "offer", "cta", "timeline", "results"] as const;

export default async function SectionPage({ params, searchParams }: SectionPageProps) {
  const { id } = await params;
  const { pageId: queryPageId, tab } = await searchParams;
  
  // Get section first
  const section = await getSectionById(id);
  if (!section) {
    notFound();
  }

  // Get pageId from query params, or try to find first page that contains this section
  let pageId: string | null = queryPageId || null;
  if (!pageId) {
    pageId = await getFirstPageIdBySectionId(id);
  }

  const hasContentItems = CONTENT_SECTION_TYPES.includes(section.type as any);
  const isHeroSection = section.type === "hero";
  const isHeaderSection = section.type === "header";
  const isStoriesSection = section.type === "stories";
  const isLogosSection = section.type === "logos";
  const isFooterSection = section.type === "footer";
  const hasMediaAndCTATabs = isHeroSection;
  const hasCTATabOnly = isHeaderSection;
  const hasMediaTabOnly = isStoriesSection;

  // Fetch content items if this section type has them
  let initialFAQItems: Awaited<ReturnType<typeof getFAQItemsBySectionId>> = [];
  let initialTestimonials: Awaited<ReturnType<typeof getTestimonialsBySectionId>> = [];
  let initialFeatures: Awaited<ReturnType<typeof getFeaturesBySectionId>> = [];
  let initialCTAButtons: Awaited<ReturnType<typeof getCTAButtonsBySectionId>> = [];
  let initialTimelineItems: Awaited<ReturnType<typeof getTimelineBySectionId>> = [];
  let initialResults: Awaited<ReturnType<typeof getResultsBySectionId>> = [];

  if (hasContentItems) {
    if (section.type === "faq") {
      initialFAQItems = await getFAQItemsBySectionId(id);
    } else if (section.type === "testimonials") {
      initialTestimonials = await getTestimonialsBySectionId(id);
    } else if (section.type === "features") {
      initialFeatures = await getFeaturesBySectionId(id);
    } else if (section.type === "offer") {
      initialFeatures = await getFeaturesBySectionId(id);
    } else if (section.type === "cta") {
      initialCTAButtons = await getCTAButtonsBySectionId(id);
    } else if (section.type === "timeline") {
      initialTimelineItems = await getTimelineBySectionId(id);
    } else if (section.type === "results") {
      initialResults = await getResultsBySectionId(id);
    }
  }

  // For hero sections, get media and CTA buttons from the section data
  // For header sections, get CTA buttons from the section data
  // For stories sections, get media from the section data
  const initialMedia = (hasMediaAndCTATabs || hasMediaTabOnly) ? (section.media || []) : [];
  const initialHeroCTAButtons = (hasMediaAndCTATabs || hasCTATabOnly) ? (section.ctaButtons || []) : [];

  // Fetch softwares for logos sections
  let initialSoftwares: Awaited<ReturnType<typeof getSoftwaresBySectionId>> = [];
  if (isLogosSection) {
    initialSoftwares = await getSoftwaresBySectionId(id);
  }

  // Fetch social platforms for footer sections
  let initialSocialPlatforms: Awaited<ReturnType<typeof getSocialPlatformsBySectionId>> = [];
  if (isFooterSection) {
    initialSocialPlatforms = await getSocialPlatformsBySectionId(id);
  }

  // Fetch page_section status for this section on this page (only if pageId exists)
  const pageSectionStatus = pageId ? await getPageSectionStatus(pageId, id) : null;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title={section.admin_title || section.title || section.type}
          rightSideContent={
            pageSectionStatus ? (
              <SectionStatusHeader
                pageId={pageId!}
                pageSectionId={pageSectionStatus.id}
                initialStatus={pageSectionStatus.status}
              />
            ) : null
          }
        />
      </div>
      <SectionContentTabs
        section={section}
        pageId={pageId || undefined}
        initialFAQItems={initialFAQItems}
        initialTestimonials={initialTestimonials}
        initialFeatures={initialFeatures}
        initialCTAButtons={initialCTAButtons}
        initialMedia={initialMedia}
        initialHeroCTAButtons={initialHeroCTAButtons}
        initialTimelineItems={initialTimelineItems}
        initialResults={initialResults}
        initialSoftwares={initialSoftwares}
        initialSocialPlatforms={initialSocialPlatforms}
      />
    </div>
  );
}
