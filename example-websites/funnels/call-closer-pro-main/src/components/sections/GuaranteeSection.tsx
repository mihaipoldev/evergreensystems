const GuaranteeSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <div className="guarantee-box text-center">
          <h2 className="heading-section mb-6">Performance Guarantee</h2>
          <p className="text-body mb-6">We remove the downside completely.</p>

          <div className="text-left bg-background/50 rounded-lg p-6 mb-6">
            <p className="text-body mb-4">Here's how it works:</p>
            <ul className="list-checkmark">
              <li>You pay a <strong className="text-foreground">one-time setup fee</strong> to build the system</li>
              <li>Once the system goes live, <strong className="text-foreground">monthly management begins</strong></li>
              <li>
                If the system does not produce at least <strong className="text-foreground">10 qualified sales calls within 30 days</strong> of going live: both the setup fee and the first month's management fee are <strong className="text-foreground">fully refunded</strong>
              </li>
            </ul>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <p>No long-term contracts.</p>
            <p>No hidden conditions.</p>
            <p>No paying for activity instead of outcomes.</p>
          </div>

          <p className="text-lg font-medium text-foreground mt-6">
            You are paying for results, not promises.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
