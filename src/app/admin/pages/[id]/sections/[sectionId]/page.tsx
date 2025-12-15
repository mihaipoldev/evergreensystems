import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { SectionContentTabs } from "@/components/admin/SectionContentTabs";
import { SectionStatusHeader } from "@/components/admin/SectionStatusHeader";
import { getSectionById } from "@/features/sections/data";
import { getFeaturesBySectionId, getTestimonialsBySectionId, getFAQItemsBySectionId, getTimelineBySectionId, getResultsBySectionId, getCTAButtonsBySectionId, getPageSectionStatus, getSoftwaresBySectionId, getSocialPlatformsBySectionId } from "@/lib/supabase/queries";

type SectionPageProps = {
  params: Promise<{ id: string; sectionId: string }>;
};

// Section types that have associated content items
const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "cta", "timeline", "results"] as const;

export default async function SectionPage({ params }: SectionPageProps) {
  const { id: pageId, sectionId } = await params;
  const section = await getSectionById(sectionId);

  if (!section) {
    notFound();
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
      initialFAQItems = await getFAQItemsBySectionId(sectionId);
    } else if (section.type === "testimonials") {
      initialTestimonials = await getTestimonialsBySectionId(sectionId);
    } else if (section.type === "features") {
      initialFeatures = await getFeaturesBySectionId(sectionId);
    } else if (section.type === "cta") {
      initialCTAButtons = await getCTAButtonsBySectionId(sectionId);
    } else if (section.type === "timeline") {
      initialTimelineItems = await getTimelineBySectionId(sectionId);
    } else if (section.type === "results") {
      initialResults = await getResultsBySectionId(sectionId);
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
    initialSoftwares = await getSoftwaresBySectionId(sectionId);
  }

  // Fetch social platforms for footer sections
  let initialSocialPlatforms: Awaited<ReturnType<typeof getSocialPlatformsBySectionId>> = [];
  if (isFooterSection) {
    initialSocialPlatforms = await getSocialPlatformsBySectionId(sectionId);
  }

  // Fetch page_section status for this section on this page
  const pageSectionStatus = await getPageSectionStatus(pageId, sectionId);

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title={section.admin_title || section.title || section.type}
          rightSideContent={
            pageSectionStatus ? (
              <SectionStatusHeader
                pageId={pageId}
                pageSectionId={pageSectionStatus.id}
                initialStatus={pageSectionStatus.status}
              />
            ) : null
          }
        />
      </div>
      <SectionContentTabs
        section={section}
        pageId={pageId}
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
