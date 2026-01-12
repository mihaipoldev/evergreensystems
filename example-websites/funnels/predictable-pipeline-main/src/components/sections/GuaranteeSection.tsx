const GuaranteeSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">
        Performance Guarantee (Risk Reversal)
      </h2>

      <p className="text-lg text-foreground/80 mb-8">
        We remove the downside completely.
      </p>

      <p className="text-muted-foreground mb-4">Here's how it works:</p>

      <ul className="space-y-3 text-foreground/80 mb-8 ml-4">
        <li>• You pay a <strong>one-time setup fee</strong> to build the system</li>
        <li>• Once the system goes live, <strong>monthly management begins</strong></li>
        <li>• If the system does <strong>not produce at least 10 qualified sales calls within 30 days of going live</strong>:</li>
      </ul>

      <div className="bg-accent/30 border border-primary/20 rounded-lg p-6 mb-8">
        <p className="text-lg font-medium text-center">
          Both the setup fee and the first month's management fee are fully refunded
        </p>
      </div>

      <div className="space-y-2 text-foreground/80">
        <p>No long-term contracts.</p>
        <p>No hidden conditions.</p>
        <p>No paying for activity instead of outcomes.</p>
      </div>

      <p className="text-lg font-medium mt-6">
        You are paying for <strong>results</strong>, not promises.
      </p>
    </section>
  );
};

export default GuaranteeSection;
