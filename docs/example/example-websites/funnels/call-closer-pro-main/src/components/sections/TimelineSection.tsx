const timelineSteps = [
  {
    title: "Alignment and Discovery",
    description: "We start by aligning on your offer, ideal customer profile, and sales goals. This step ensures targeting, messaging, and qualification criteria are intentional from the beginning.",
  },
  {
    title: "Infrastructure Setup",
    description: "Dedicated secondary domains and sending inboxes are purchased and configured to protect your main domain and establish a clean foundation for outbound.",
  },
  {
    title: "Warmup Phase",
    description: "Inboxes go through a controlled warmup period (typically around 21 days). Sending reputation is built gradually to avoid spam issues and ensure emails reach real inboxes.",
  },
  {
    title: "ICP Definition and Enrichment Logic",
    description: "While inboxes warm up, we finalize ICP rules, sourcing logic, and enrichment criteria. Leads are filtered and enriched with relevant context.",
  },
  {
    title: "System Build and Launch Preparation",
    description: "Messaging is written, follow-ups are structured into a three-step sequence, reply handling is configured, and the booking flow is set up.",
  },
  {
    title: "Launch and Optimization",
    description: "Campaigns go live with enriched data and controlled sending. Replies are monitored, qualified conversations are booked, and performance is continuously refined.",
  },
];

const TimelineSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-3">
          Timeline: How This Goes Live
        </h2>
        <p className="text-body text-center mb-10">
          A structured rollout designed to protect deliverability, ensure data quality, and avoid rushed launches.
        </p>

        <div className="mb-10">
          {timelineSteps.map((step, index) => (
            <div key={index} className="timeline-step">
              <p className="text-sm font-medium text-accent mb-1">Step {index + 1}</p>
              <h3 className="font-medium text-foreground mb-2">{step.title}</h3>
              <p className="text-small">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="card-subtle">
          <h3 className="heading-subsection mb-2">What success looks like</h3>
          <p className="text-body mb-2">
            The system is live and producing qualified sales conversations on a consistent basis.
          </p>
          <p className="text-small">
            We do not measure success by emails sent or activity levels. We measure it by real conversations with decision-makers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
