const included = [
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
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-8">Pricing</h2>

        <p className="text-body text-center mb-8">
          We build and run the entire outbound system for you.
        </p>

        <div className="card-subtle mb-6">
          <h3 className="heading-subsection mb-4">This includes:</h3>
          <ul className="list-checkmark">
            {included.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card-subtle mb-8">
          <h3 className="heading-subsection mb-4">Pricing is based on:</h3>
          <ul className="space-y-2">
            {pricingFactors.map((factor, index) => (
              <li key={index} className="flex items-start gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-body text-center">
          Because every outbound system is scoped differently, pricing is discussed after a short qualification call. This ensures the system is built to fit your business, not forced into a generic package.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
