import { Check } from "lucide-react";

const deliverables = [
  "ICP research and buyer definition aligned to your offer",
  "Lead sourcing for your exact target accounts",
  "AI driven lead filtering and enrichment before any outreach",
  "Purchase and setup of dedicated secondary domains",
  "Creation of sending inboxes under those domains",
  "Deliverability and authentication configuration for sending domains",
  "Inbox warmup, reputation protection and sending safeguards",
  "Connection to a centralized sending platform",
  "Campaign setup using a structured three step sequence",
  "Ongoing campaign execution and follow ups",
  "Reply handling and basic qualification",
  "Sales calls booked directly to your calendar",
  "Continuous optimization based on real reply data",
];

const WhatYouGetSection = () => {
  return (
    <section className="section-container section-spacing bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-lg mb-4 text-center">
          What You Get Done For You
        </h2>
        <p className="body-md text-center mb-10">
          A fully managed outbound system built, operated, and optimized on your behalf.
        </p>

        <div className="bg-background rounded-xl p-6 md:p-8 border border-border mb-8">
          <h3 className="heading-sm mb-6">Included in the system:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {deliverables.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="body-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="body-md font-medium text-foreground">You do not manage tools.</p>
          <p className="body-md font-medium text-foreground">You do not chase leads.</p>
          <p className="body-md font-medium text-foreground">You do not babysit campaigns.</p>
          <p className="body-lg font-semibold text-foreground mt-4">
            You show up to qualified conversations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
