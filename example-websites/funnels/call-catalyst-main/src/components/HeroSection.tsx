import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="section-container py-12 md:py-20">
      {/* Headline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="heading-xl mb-6">
          We Build & Run an Outbound System That Books Qualified Sales Calls
        </h1>
        <p className="body-lg max-w-2xl mx-auto">
          An always-on outbound system that runs in the background while you focus on closing, powered by AI-driven lead enrichment so every conversation starts with real context, not guesswork.
        </p>
        <p className="body-md mt-4 font-medium text-foreground">
          Built for B2B founders who need predictable pipeline — not random leads.
        </p>
      </div>

      {/* VSL Video Player */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden border border-border shadow-sm">
          {/* Video placeholder - replace with actual video embed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className="w-0 h-0 border-l-[20px] border-l-primary border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
              <p className="body-sm">Watch the overview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="text-center">
        <Button variant="cta" size="xl">
          Book a Qualification Call
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
