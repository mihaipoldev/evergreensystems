"use client";

import { motion } from "framer-motion";
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

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

export default function OutboundSystemPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
     
      {/* Content Layer */}
      <div className="relative z-10">
        <Header />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-primary/5 pointer-events-none"></div>
          <HeroSection />
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
          <OutcomesSection />
        </div>

        <BenchmarksSection />
  
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent pointer-events-none"></div>
          <WhyOutboundSection />
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
          <WhatYouGetSection />
        </div>
        
        <ComparisonSection />
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent pointer-events-none"></div>
          <TimelineSection />
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent pointer-events-none"></div>
          <PricingSection />
        </div>
        
        <FAQSection />
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none"></div>
          <FinalCTASection />
          <Footer />
        </div>
      </div>
    </main>
  );
}
