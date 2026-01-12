import HeroSection from "@/components/sections/HeroSection";
import PromiseSection from "@/components/sections/PromiseSection";
import OutcomesSection from "@/components/sections/OutcomesSection";
import WhyOutboundSection from "@/components/sections/WhyOutboundSection";
import ProblemSection from "@/components/sections/ProblemSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import KPIsSection from "@/components/sections/KPIsSection";
import DeliverablesSection from "@/components/sections/DeliverablesSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import SimplicitySection from "@/components/sections/SimplicitySection";
import TimelineSection from "@/components/sections/TimelineSection";
import PricingSection from "@/components/sections/PricingSection";
import GuaranteeSection from "@/components/sections/GuaranteeSection";
import FAQSection from "@/components/sections/FAQSection";
import FinalCTASection from "@/components/sections/FinalCTASection";
import FooterSection from "@/components/sections/FooterSection";

const SectionDivider = () => <div className="section-divider max-w-4xl mx-auto" />;

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <SectionDivider />
      <PromiseSection />
      <SectionDivider />
      <OutcomesSection />
      <SectionDivider />
      <WhyOutboundSection />
      <SectionDivider />
      <ProblemSection />
      <SectionDivider />
      <HowItWorksSection />
      <SectionDivider />
      <KPIsSection />
      <SectionDivider />
      <DeliverablesSection />
      <SectionDivider />
      <ComparisonSection />
      <SectionDivider />
      <SimplicitySection />
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
      <FooterSection />
    </div>
  );
};

export default Index;
