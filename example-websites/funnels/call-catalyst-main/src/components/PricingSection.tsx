import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const pricingIncludes = [
  "ICP research and targeting",
  "Lead sourcing and AI driven enrichment",
  "Dedicated sending inboxes",
  "Deliverability focused sending infrastructure",
  "Campaign setup and execution",
  "Reply handling and qualification",
  "Calendar booking flow",
  "Ongoing optimization based on real reply data",
];

const pricingFactors = [
  "Target market and ICP complexity",
  "Outreach volume required to meet your goals",
  "Level of enrichment and personalization needed",
  "Sales capacity and desired pace of growth",
];

const PricingSection = () => {
  return (
    <section className="section-container section-spacing">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-lg mb-4 text-center">Pricing</h2>
        <p className="body-md text-center mb-10">
          We build and run the entire outbound system for you.
        </p>

        <div className="bg-secondary/30 rounded-xl p-6 md:p-8 border border-border mb-8">
          <h3 className="heading-sm mb-6">This includes:</h3>
          <div className="grid md:grid-cols-2 gap-3 mb-8">
            {pricingIncludes.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="body-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>

          <h3 className="heading-sm mb-4">Pricing is based on:</h3>
          <ul className="space-y-2">
            {pricingFactors.map((item, index) => (
              <li key={index} className="body-md flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="body-md text-center mb-8">
          Because every outbound system is scoped differently, pricing is discussed after a short qualification call. This ensures the system is built to fit your business, not forced into a generic package.
        </p>

        {/* Guarantee */}
        <div className="bg-primary/5 rounded-xl p-6 md:p-8 border-2 border-primary/20 mb-8">
          <h3 className="heading-md mb-4 text-center">Performance Guarantee</h3>
          <p className="body-md text-center mb-6">We remove the downside completely.</p>
          
          <div className="space-y-3 mb-6">
            <p className="body-md">
              • You pay a <span className="font-medium text-foreground">one-time setup fee</span> to build the system
            </p>
            <p className="body-md">
              • Once the system goes live, <span className="font-medium text-foreground">monthly management begins</span>
            </p>
            <p className="body-md">
              • If the system does <span className="font-medium text-foreground">not produce at least 10 qualified sales calls within 30 days</span> of going live: <span className="font-semibold text-foreground">both the setup fee and the first month's management fee are fully refunded</span>
            </p>
          </div>

          <div className="text-center space-y-1">
            <p className="body-sm">No long-term contracts.</p>
            <p className="body-sm">No hidden conditions.</p>
            <p className="body-sm">No paying for activity instead of outcomes.</p>
            <p className="body-md font-semibold text-foreground mt-3">
              You are paying for results, not promises.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button variant="cta" size="xl">
            Book a Strategy Call
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
