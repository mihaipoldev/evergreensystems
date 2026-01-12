const benchmarks = [
  {
    title: "Reply Quality",
    value: "8–15%",
    description: "of replies are context-aware, human responses",
    subtext: "Replies that reference the message, company, or problem — not auto-responses or unsubscribes.",
  },
  {
    title: "Conversation to Call",
    value: "25–40%",
    description: "of qualified conversations book a call",
    subtext: "Measured after fit checks and intent validation.",
  },
  {
    title: "Call Show-Up Rate",
    value: "75–90%",
    description: "attendance on booked calls",
    subtext: "Driven by proper framing, confirmation, and reminder logic.",
  },
  {
    title: "Time to First Signal",
    value: "7–14 days",
    description: "after system goes live",
    subtext: "Initial replies and qualified conversations indicate correct targeting.",
  },
  {
    title: "Performance Improvement",
    value: "20–40%",
    description: "improvement in reply quality within 30–60 days",
    subtext: "As targeting, enrichment, and messaging compound.",
  },
  {
    title: "Deliverability Health",
    value: "<2%",
    description: "bounce rate · <0.1% spam complaints",
    subtext: "Maintained through domain isolation and controlled sending.",
  },
];

const BenchmarksSection = () => {
  return (
    <section className="section-container section-spacing bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-4">Expected Outcomes</h2>
          <p className="body-md max-w-2xl mx-auto">
            What this system is designed to optimize for:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benchmarks.map((benchmark, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 border border-border"
            >
              <p className="body-sm font-medium text-muted-foreground mb-2">
                {benchmark.title}
              </p>
              <p className="text-2xl md:text-3xl font-semibold text-foreground mb-1">
                {benchmark.value}
              </p>
              <p className="body-sm text-foreground mb-3">
                {benchmark.description}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {benchmark.subtext}
              </p>
            </div>
          ))}
        </div>

        <p className="body-md text-center mt-10 max-w-2xl mx-auto">
          This is not a "blast leads and pray" model. It is a system designed to create <span className="font-medium text-foreground">reliable sales conversations</span>, not vanity metrics.
        </p>
      </div>
    </section>
  );
};

export default BenchmarksSection;
