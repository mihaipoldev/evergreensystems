import { getActivePageBySlug } from "@/features/page-builder/pages/queries";
import { getVisibleSectionsByPageId } from "@/features/page-builder/sections/queries";
import Header from "@/features/funnels/components/Header";
import HeroSection from "@/features/funnels/components/HeroSection";
import OutcomesSection from "@/features/funnels/components/OutcomesSection";
import BenchmarksSection from "@/features/funnels/components/BenchmarksSection";
import WhyOutboundSection from "@/features/funnels/components/WhyOutboundSection";
import WhatYouGetSection from "@/features/funnels/components/WhatYouGetSection";
import ComparisonSection from "@/features/funnels/components/ComparisonSection";
import TimelineSection from "@/features/funnels/components/TimelineSection";
import PricingSection from "@/features/funnels/components/PricingSection";
import FAQSection from "@/features/funnels/components/FAQSection";
import FinalCTASection from "@/features/funnels/components/FinalCTASection";
import Footer from "@/features/funnels/components/Footer";
import type { MediaWithSection } from "@/features/page-builder/media/types";

function getMainMedia(section: { media?: MediaWithSection[]; media_url?: string | null }) {
  if (!section?.media?.length) return null;
  const main = section.media.find((m) => m.section_media?.role === "main");
  return main ?? section.media[0] ?? null;
}

export default async function OutboundSystemPage() {
  const homePage = await getActivePageBySlug("home");
  let heroVideo: {
    mainMedia: MediaWithSection | null;
    videoId: string | null;
    mediaUrl: string | null;
  } | null = null;

  if (homePage) {
    const sections = await getVisibleSectionsByPageId(homePage.id);
    const hero = sections.find((s) => s.type === "hero");
    if (hero) {
      const mainMedia = getMainMedia(hero);
      const videoId =
        mainMedia?.embed_id ??
        (mainMedia?.source_type === "wistia" && mainMedia?.embed_id ? mainMedia.embed_id : null) ??
        null;
      heroVideo = {
        mainMedia: mainMedia ?? null,
        videoId,
        mediaUrl: hero.media_url ?? null,
      };
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10">
        <Header />
        <div className="relative">
          <HeroSection heroVideo={heroVideo} />
        </div>

        <div className="relative">
          <OutcomesSection />
        </div>

        <BenchmarksSection />

        <div className="relative">
          <WhyOutboundSection />
        </div>

        <div className="relative">
          <WhatYouGetSection />
        </div>

        <ComparisonSection />

        <div className="relative">
          <TimelineSection />
        </div>

        <div className="relative">
          <PricingSection />
        </div>

        <FAQSection />

        <div className="relative">
          <FinalCTASection />
          <Footer />
        </div>
      </div>
    </main>
  );
}
