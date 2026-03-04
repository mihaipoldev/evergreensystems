const ComparisonSection = () => {
  return (
    <section className="section-container section-spacing">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-lg mb-10 text-center">
          Why This Model Makes Sense
        </h2>

        <p className="body-md mb-8">
          If you want outbound to work as a real acquisition channel, there are only three paths.
        </p>

        <div className="space-y-6">
          {/* Option 1 */}
          <div className="p-6 rounded-xl bg-secondary/50 border border-border">
            <h3 className="heading-sm mb-3">1. Build it yourself</h3>
            <p className="body-md">
              You can learn outbound internally. This usually means weeks spent learning tools, deliverability basics, and workflows. Most teams underestimate how much data quality and infrastructure discipline matter until time and reputation are already lost.
            </p>
          </div>

          {/* Option 2 */}
          <div className="p-6 rounded-xl bg-secondary/50 border border-border">
            <h3 className="heading-sm mb-3">2. Hire a typical lead generation agency</h3>
            <p className="body-md">
              You can outsource outbound to an agency. In most cases, you pay for activity, not outcomes. Leads are delivered without meaningful context, and the system itself is not owned by you.
            </p>
          </div>

          {/* Option 3 - Highlighted */}
          <div className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20">
            <h3 className="heading-sm mb-3">3. Run a fully managed, enriched outbound system</h3>
            <p className="body-md mb-4">
              This is the Evergreen Systems model.
            </p>
            <p className="body-md">
              The system is built, operated, and improved for you. Data quality, enrichment, infrastructure, and execution live inside one system. <span className="font-medium text-foreground">You focus on sales. The system handles acquisition.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
