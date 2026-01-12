import HeroSection from "@/components/HeroSection";
import OutcomesSection from "@/components/OutcomesSection";
import BenchmarksSection from "@/components/BenchmarksSection";
import WhyOutboundSection from "@/components/WhyOutboundSection";
import ProblemSection from "@/components/ProblemSection";
import SystemSection from "@/components/SystemSection";
import WhatYouGetSection from "@/components/WhatYouGetSection";
import ComparisonSection from "@/components/ComparisonSection";
import TimelineSection from "@/components/TimelineSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <div className="divider" />
      <OutcomesSection />
      <BenchmarksSection />
      <WhyOutboundSection />
      <ProblemSection />
      <SystemSection />
      <WhatYouGetSection />
      <ComparisonSection />
      <TimelineSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
};

export default Index;
