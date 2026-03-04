const steps = [
  {
    title: "Alignment and Discovery",
    description: "We start by aligning on your offer, ideal customer profile, and sales goals. This step ensures targeting, messaging, and qualification criteria are intentional from the beginning, so the system is built around who you actually want to speak with and not generic outbound assumptions."
  },
  {
    title: "Infrastructure Setup",
    description: "Dedicated secondary domains and sending inboxes are purchased and configured. This step exists to protect your main domain and establish a clean foundation for outbound, with deliverability and reputation considered before any outreach begins."
  },
  {
    title: "Warmup Phase",
    description: "Inboxes go through a controlled warmup period that typically lasts around 21 days. During this phase, sending reputation is built gradually to avoid spam issues, protect domains, and ensure emails are able to reach real inboxes once campaigns go live."
  },
  {
    title: "ICP Definition and Enrichment Logic",
    description: "While inboxes warm up, we finalize ICP rules, sourcing logic, and enrichment criteria. Leads are filtered and enriched with relevant context so outreach is based on real data and personalization, not assumptions or static lists."
  },
  {
    title: "System Build and Launch Preparation",
    description: "Messaging is written, follow ups are structured into a three step sequence, reply handling is configured, and the booking flow is set up. Everything is reviewed and prepared so the system is ready to launch the moment warmup is complete."
  },
  {
    title: "Launch and Optimization",
    description: "Campaigns go live with enriched data and controlled sending. Replies are monitored, qualified conversations are booked directly to your calendar, and performance is continuously refined based on real engagement and sales feedback."
  }
];

const TimelineSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">
        Timeline: How This Goes Live
      </h2>

      <p className="text-muted-foreground mb-10">
        This is a structured rollout designed to protect deliverability, ensure data quality, and avoid rushed launches that break systems.
      </p>

      <div className="space-y-8 mb-12">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="w-px h-full bg-border mt-2" />
              )}
            </div>
            <div className="pb-8">
              <h3 className="font-medium mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-medium mb-2">What success looks like</h3>
        <p className="text-foreground/80 mb-4">
          Success is simple. The system is live and producing qualified sales conversations on a consistent basis.
        </p>
        <p className="text-muted-foreground text-sm mb-2">
          We do not measure success by emails sent or activity levels.
        </p>
        <p className="text-muted-foreground text-sm">
          We measure it by real conversations with decision-makers.
        </p>
        <p className="text-foreground/80 mt-4">
          Once conversations are happening, performance improves through optimization and scale.
        </p>
      </div>
    </section>
  );
};

export default TimelineSection;
