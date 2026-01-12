import { CTAButton } from "@/components/ui/cta-button";

const HeroSection = () => {
  return (
    <section className="editorial-container pt-16 md:pt-24 pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight text-balance mb-6">
        We Build & Run an Outbound System That Books Qualified Sales Calls{" "}
        <span className="text-muted-foreground">(Done-For-You)</span>
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
        An always-on outbound system that runs in the background while you focus on closing, powered by AI-driven lead enrichment so every conversation starts with real context, not guesswork.
      </p>
      
      <p className="text-base text-foreground/80 mb-10">
        <strong>Built for B2B founders who need predictable pipeline — not random leads.</strong>
      </p>

      {/* Video Player Placeholder */}
      <div className="aspect-video bg-card border border-border rounded-lg flex items-center justify-center mb-10">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <p className="text-sm">Video Sales Letter</p>
        </div>
      </div>

      <div className="flex justify-center">
        <CTAButton>Book a Qualification Call</CTAButton>
      </div>
    </section>
  );
};

export default HeroSection;
