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

const DeliverablesSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-3">
          What You Get Done For You
        </h2>
        <p className="text-body text-center mb-8">
          A fully managed outbound system built, operated, and optimized on your behalf.
        </p>

        <div className="card-subtle mb-8">
          <h3 className="heading-subsection mb-4">Included in the system:</h3>
          <ol className="space-y-3">
            {deliverables.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="process-number text-xs">{index + 1}</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="text-center bg-secondary/30 rounded-lg p-6">
          <p className="text-body mb-2">
            You do not manage tools.<br />
            You do not chase leads.<br />
            You do not babysit campaigns.
          </p>
          <p className="font-medium text-foreground">
            You show up to qualified conversations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DeliverablesSection;
