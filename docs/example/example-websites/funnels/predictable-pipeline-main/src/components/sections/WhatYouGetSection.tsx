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
  "Continuous optimization based on real reply data"
];

const WhatYouGetSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">
        What You Get Done For You
      </h2>

      <p className="text-muted-foreground mb-8">
        A fully managed outbound system built, operated, and optimized on your behalf.
      </p>

      <h3 className="text-lg font-medium mb-6">Included in the system:</h3>

      <ol className="space-y-3 mb-10">
        {deliverables.map((item, index) => (
          <li key={index} className="flex gap-4 text-foreground/80">
            <span className="text-muted-foreground text-sm w-6 shrink-0">{index + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>

      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-foreground/80 mb-2">You do not manage tools.</p>
        <p className="text-foreground/80 mb-2">You do not chase leads.</p>
        <p className="text-foreground/80 mb-4">You do not babysit campaigns.</p>
        <p className="text-lg font-medium">You show up to qualified conversations.</p>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
