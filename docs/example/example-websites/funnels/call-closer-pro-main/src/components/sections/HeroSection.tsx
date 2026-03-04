import { Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="section-container pt-12 md:pt-20">
      {/* Headline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="heading-display mb-6">
          We Build & Run an Outbound System That Books Qualified Sales Calls
        </h1>
        <p className="text-body max-w-2xl mx-auto">
          An always-on outbound system that runs in the background while you focus on closing, powered by AI-driven lead enrichment so every conversation starts with real context, not guesswork.
        </p>
        <p className="text-small mt-4 font-medium text-foreground/70">
          Built for B2B founders who need predictable pipeline — not random leads.
        </p>
      </div>

      {/* VSL Container */}
      <div className="video-container mb-8">
        <div className="video-placeholder">
          <div className="play-button">
            <Play className="w-8 h-8 text-accent-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a href="#book-call" className="cta-primary">
          Book a Qualification Call
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
