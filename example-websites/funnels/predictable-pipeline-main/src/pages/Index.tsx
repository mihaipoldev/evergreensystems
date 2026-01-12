import TableOfContents from "@/components/sections/TableOfContents";
import HeroSection from "@/components/sections/HeroSection";
import OutcomesSection from "@/components/sections/OutcomesSection";
import ExpectedOutcomesSection from "@/components/sections/ExpectedOutcomesSection";
import WhyOutboundSection from "@/components/sections/WhyOutboundSection";
import ProblemSection from "@/components/sections/ProblemSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import KPIsSection from "@/components/sections/KPIsSection";
import WhatYouGetSection from "@/components/sections/WhatYouGetSection";
import WhyThisModelSection from "@/components/sections/WhyThisModelSection";
import SystemSimplicitySection from "@/components/sections/SystemSimplicitySection";
import TimelineSection from "@/components/sections/TimelineSection";
import PricingSection from "@/components/sections/PricingSection";
import GuaranteeSection from "@/components/sections/GuaranteeSection";
import FAQSection from "@/components/sections/FAQSection";
import FinalCTASection from "@/components/sections/FinalCTASection";

const SectionDivider = () => <div className="section-divider" />;

const Index = () => {
  return (
    <main className="min-h-screen bg-background py-8 md:py-12">
      <TableOfContents />
      <SectionDivider />
      
      <HeroSection />
      <SectionDivider />
      
      <OutcomesSection />
      <SectionDivider />
      
      <ExpectedOutcomesSection />
      <SectionDivider />
      
      <WhyOutboundSection />
      <SectionDivider />
      
      <ProblemSection />
      <SectionDivider />
      
      <HowItWorksSection />
      <SectionDivider />
      
      <KPIsSection />
      <SectionDivider />
      
      <WhatYouGetSection />
      <SectionDivider />
      
      <WhyThisModelSection />
      <SectionDivider />
      
      <SystemSimplicitySection />
      <SectionDivider />
      
      <TimelineSection />
      <SectionDivider />
      
      <PricingSection />
      <SectionDivider />
      
      <GuaranteeSection />
      <SectionDivider />
      
      <FAQSection />
      <SectionDivider />
      
      <FinalCTASection />
      
      <div className="h-24" />
    </main>
  );
};

export default Index;
