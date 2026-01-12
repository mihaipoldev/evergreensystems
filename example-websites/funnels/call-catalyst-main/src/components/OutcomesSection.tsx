import { Check } from "lucide-react";

const OutcomesSection = () => {
  return (
    <section className="section-container section-spacing">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">
            Get Consistent, Qualified Sales Calls
          </h2>
          <p className="heading-md text-muted-foreground font-normal">
            At least 10 qualified sales calls within 30 days of the system going live
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-10">
          {[
            "Without spending tens of thousands on ads",
            "Without paying bloated retainers for \"leads\" that go nowhere",
            "Without managing tools, inboxes, follow-ups, or infrastructure",
          ].map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <p className="body-md">{benefit}</p>
            </div>
          ))}
        </div>

        {/* Core Value Prop */}
        <div className="bg-secondary/50 rounded-xl p-6 md:p-8 border border-border mb-10">
          <p className="body-lg text-center font-medium text-foreground">
            We build and run the entire outbound system for you — end-to-end.
          </p>
          <p className="body-md text-center mt-3">
            You only show up to qualified calls booked directly on your calendar.
          </p>
        </div>

        {/* Qualifier */}
        <div className="bg-muted/50 rounded-lg p-5 border border-border/50">
          <p className="body-sm text-center">
            <span className="font-medium text-foreground">⚠️ Only continue if you're a B2B founder or decision-maker</span> with a clear offer and the ability to handle new sales conversations. This is not for experiments, short-term spikes, or "growth hacks." This is for founders who want a <span className="font-medium text-foreground">repeatable, system-driven acquisition channel.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
