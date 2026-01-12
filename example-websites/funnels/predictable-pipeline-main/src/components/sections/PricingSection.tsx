const PricingSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">
        Pricing
      </h2>

      <p className="text-foreground/80 mb-6">
        We build and run the entire outbound system for you.
      </p>

      <p className="text-muted-foreground mb-4">This includes:</p>

      <ul className="space-y-2 text-foreground/80 mb-10 ml-4">
        <li>• ICP research and targeting</li>
        <li>• Lead sourcing and AI driven enrichment</li>
        <li>• Dedicated sending inboxes</li>
        <li>• Deliverability focused sending infrastructure</li>
        <li>• Campaign setup and execution</li>
        <li>• Reply handling and qualification</li>
        <li>• Calendar booking flow</li>
        <li>• Ongoing optimization based on real reply data</li>
      </ul>

      <p className="text-muted-foreground mb-4">Pricing is based on:</p>

      <ul className="space-y-2 text-foreground/80 mb-10 ml-4">
        <li>• Target market and ICP complexity</li>
        <li>• Outreach volume required to meet your goals</li>
        <li>• Level of enrichment and personalization needed</li>
        <li>• Sales capacity and desired pace of growth</li>
      </ul>

      <p className="text-foreground/80">
        Because every outbound system is scoped differently, pricing is discussed after a short qualification call. This ensures the system is built to fit your business, not forced into a generic package.
      </p>
    </section>
  );
};

export default PricingSection;
