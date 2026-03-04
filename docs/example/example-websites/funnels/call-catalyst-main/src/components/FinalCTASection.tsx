import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => {
  return (
    <section className="section-container section-spacing">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="heading-lg mb-6">
          Ready to Start Getting Qualified Calls?
        </h2>

        <div className="space-y-4 mb-10">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="body-md">
              <span className="font-medium text-foreground">Worst case:</span> You walk away with a clearer outbound strategy and a better understanding of what would actually work for your business.
            </p>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="body-md">
              <span className="font-medium text-foreground">Best case:</span> You install a predictable, enriched acquisition system that books qualified sales conversations consistently.
            </p>
          </div>
        </div>

        <Button variant="cta" size="xl">
          Book a Strategy Call
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="body-sm mt-6">
          No pressure. Just a clear look at whether this system is the right fit for your business.
        </p>
      </div>
    </section>
  );
};

export default FinalCTASection;
