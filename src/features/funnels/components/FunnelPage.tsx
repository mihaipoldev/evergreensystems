"use client";

import Header from "./Header";
import HeroSection from "./HeroSection";
import type { HeroVideoProps } from "./HeroSection";
import OutcomesSection from "./OutcomesSection";
import BenchmarksSection from "./BenchmarksSection";
import WhyOutboundSection from "./WhyOutboundSection";
import SystemDiagramSection from "./SystemDiagramSection";
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
      {/* Background texture + top glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 [background-image:radial-gradient(hsl(var(--foreground)/0.07)_1px,transparent_1.5px)] [background-size:24px_24px]" />
        {/* soft glow behind the hero */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] rounded-full bg-primary/15 blur-[130px]" />
      </div>
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

        {content.systemDiagram && (
          <div className="relative">
            <SystemDiagramSection content={content.systemDiagram} />
          </div>
        )}

        <div className="relative">
          <WhatYouGetSection content={content.whatYouGet} />
        </div>

        {content.comparison && <ComparisonSection content={content.comparison} />}

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
