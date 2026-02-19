"use client";

import Header from "./Header";
import HeroSection from "./HeroSection";
import type { HeroVideoProps } from "./HeroSection";
import OutcomesSection from "./OutcomesSection";
import BenchmarksSection from "./BenchmarksSection";
import WhyOutboundSection from "./WhyOutboundSection";
import WhatYouGetSection from "./WhatYouGetSection";
import ComparisonSection from "./ComparisonSection";
import TimelineSection from "./TimelineSection";
import PricingSection from "./PricingSection";
import FAQSection from "./FAQSection";
import FinalCTASection from "./FinalCTASection";
import Footer from "./Footer";
import type { FunnelContent } from "../types";

interface FunnelPageProps {
  content: FunnelContent;
  heroVideo: HeroVideoProps | null;
}

const FunnelPage = ({ content, heroVideo }: FunnelPageProps) => {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10">
        <Header content={content.header} />
        <div className="relative">
          <HeroSection content={content.hero} heroVideo={heroVideo} />
        </div>

        <div className="relative">
          <OutcomesSection content={content.outcomes} />
        </div>

        <BenchmarksSection content={content.benchmarks} />

        <div className="relative">
          <WhyOutboundSection content={content.whyOutbound} />
        </div>

        <div className="relative">
          <WhatYouGetSection content={content.whatYouGet} />
        </div>

        <ComparisonSection content={content.comparison} />

        <div className="relative">
          <TimelineSection content={content.timeline} />
        </div>

        <div className="relative">
          <PricingSection content={content.pricing} />
        </div>

        <FAQSection content={content.faq} />

        <div className="relative">
          <FinalCTASection content={content.finalCta} />
          <Footer content={content.footer} />
        </div>
      </div>
    </main>
  );
};

export default FunnelPage;
