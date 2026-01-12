const timelineSteps = [
  {
    step: "Step 1",
    title: "Alignment and Discovery",
    description: "We start by aligning on your offer, ideal customer profile, and sales goals. This step ensures targeting, messaging, and qualification criteria are intentional from the beginning.",
  },
  {
    step: "Step 2",
    title: "Infrastructure Setup",
    description: "Dedicated secondary domains and sending inboxes are purchased and configured. This step exists to protect your main domain and establish a clean foundation for outbound.",
  },
  {
    step: "Step 3",
    title: "Warmup Phase",
    description: "Inboxes go through a controlled warmup period that typically lasts around 21 days. During this phase, sending reputation is built gradually to avoid spam issues.",
  },
  {
    step: "Step 4",
    title: "ICP Definition and Enrichment Logic",
    description: "While inboxes warm up, we finalize ICP rules, sourcing logic, and enrichment criteria. Leads are filtered and enriched with relevant context before outreach.",
  },
  {
    step: "Step 5",
    title: "System Build and Launch Preparation",
    description: "Messaging is written, follow ups are structured into a three step sequence, reply handling is configured, and the booking flow is set up.",
  },
  {
    step: "Step 6",
    title: "Launch and Optimization",
    description: "Campaigns go live with enriched data and controlled sending. Replies are monitored, qualified conversations are booked, and performance is continuously refined.",
  },
];

const TimelineSection = () => {
  return (
    <section className="section-container section-spacing bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-lg mb-4 text-center">
          Timeline: How This Goes Live
        </h2>
        <p className="body-md text-center mb-12">
          A structured rollout designed to protect deliverability, ensure data quality, and avoid rushed launches that break systems.
        </p>

        <div className="space-y-6">
          {timelineSteps.map((item, index) => (
            <div key={index} className="flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                {index < timelineSteps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="pb-6">
                <p className="body-sm text-muted-foreground mb-1">{item.step}</p>
                <h3 className="heading-sm mb-2">{item.title}</h3>
                <p className="body-md">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Success Definition */}
        <div className="mt-12 p-6 bg-background rounded-xl border border-border text-center">
          <h3 className="heading-sm mb-3">What success looks like</h3>
          <p className="body-md">
            The system is live and producing qualified sales conversations on a consistent basis. We do not measure success by emails sent or activity levels. We measure it by <span className="font-medium text-foreground">real conversations with decision-makers</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
