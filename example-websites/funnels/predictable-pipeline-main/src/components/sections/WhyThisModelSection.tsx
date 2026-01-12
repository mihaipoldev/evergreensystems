const WhyThisModelSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-8">
        Why This Model Makes Sense
      </h2>

      <p className="text-foreground/80 mb-8">
        If you want outbound to work as a real acquisition channel, there are only three paths.
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-3">1. Build it yourself</h3>
          <p className="text-foreground/80 mb-2">
            You can learn outbound internally.
          </p>
          <p className="text-muted-foreground">
            This usually means weeks spent learning tools, deliverability basics, and workflows. Most teams underestimate how much data quality and infrastructure discipline matter until time and reputation are already lost.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">2. Hire a typical lead generation agency</h3>
          <p className="text-foreground/80 mb-2">
            You can outsource outbound to an agency.
          </p>
          <p className="text-muted-foreground">
            In most cases, you pay for activity, not outcomes. Leads are delivered without meaningful context, and the system itself is not owned by you.
          </p>
        </div>

        <div className="bg-accent/30 rounded-lg p-6 border border-primary/20">
          <h3 className="text-lg font-medium mb-3 text-primary">3. Run a fully managed, enriched outbound system</h3>
          <p className="text-foreground/80 mb-4">
            This is the Evergreen Systems model.
          </p>
          <p className="text-foreground/80 mb-2">
            The system is built, operated, and improved for you.
          </p>
          <p className="text-foreground/80 mb-2">
            Data quality, enrichment, infrastructure, and execution live inside one system.
          </p>
          <p className="text-foreground/80 mb-4">
            You focus on sales.
          </p>
          <p className="font-medium">
            The system handles acquisition.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyThisModelSection;
