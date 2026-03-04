const options = [
  {
    title: "Build it yourself",
    description: "You can learn outbound internally. This usually means weeks spent learning tools, deliverability basics, and workflows. Most teams underestimate how much data quality and infrastructure discipline matter until time and reputation are already lost.",
    highlight: false,
  },
  {
    title: "Hire a typical lead generation agency",
    description: "You can outsource outbound to an agency. In most cases, you pay for activity, not outcomes. Leads are delivered without meaningful context, and the system itself is not owned by you.",
    highlight: false,
  },
  {
    title: "Run a fully managed, enriched outbound system",
    description: "This is the Evergreen Systems model. The system is built, operated, and improved for you. Data quality, enrichment, infrastructure, and execution live inside one system. You focus on sales. The system handles acquisition.",
    highlight: true,
  },
];

const ComparisonSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-8">
          Why This Model Makes Sense
        </h2>

        <p className="text-body text-center mb-8">
          If you want outbound to work as a real acquisition channel, there are only three paths.
        </p>

        <div className="space-y-4">
          {options.map((option, index) => (
            <div
              key={index}
              className={`comparison-card ${option.highlight ? "border-accent/40 bg-accent/5" : ""}`}
            >
              <div className="flex items-start gap-4">
                <span className="process-number flex-shrink-0">{index + 1}</span>
                <div>
                  <h3 className="font-medium text-foreground mb-2">{option.title}</h3>
                  <p className="text-small">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
