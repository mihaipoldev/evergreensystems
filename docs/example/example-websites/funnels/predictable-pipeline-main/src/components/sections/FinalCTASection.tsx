import { CTAButton } from "@/components/ui/cta-button";

const FinalCTASection = () => {
  return (
    <section className="editorial-container text-center">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-8">
        Ready to Start Getting Qualified Calls?
      </h2>

      <p className="text-muted-foreground mb-2">Worst case:</p>
      <p className="text-foreground/80 mb-6">
        You walk away with a clearer outbound strategy and a better understanding of what would actually work for your business.
      </p>

      <p className="text-muted-foreground mb-2">Best case:</p>
      <p className="text-foreground/80 mb-10">
        You install a predictable, enriched acquisition system that books qualified sales conversations consistently.
      </p>

      <CTAButton>Book a Strategy Call</CTAButton>

      <p className="text-sm text-muted-foreground mt-6 italic">
        No pressure. Just a clear look at whether this system is the right fit for your business.
      </p>
    </section>
  );
};

export default FinalCTASection;
