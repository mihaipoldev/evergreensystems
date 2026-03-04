const kpis = [
  {
    title: "Reply Quality",
    value: "8–15%",
    description: "of replies are context-aware, human responses",
    subtext: "Replies that reference the message, company, or problem — not auto-responses or unsubscribes."
  },
  {
    title: "Conversation to Call",
    value: "25–40%",
    description: "of qualified conversations book a call",
    subtext: "Measured after fit checks and intent validation."
  },
  {
    title: "Call Show-Up Rate",
    value: "75–90%",
    description: "attendance on booked calls",
    subtext: "Driven by proper framing, confirmation, and reminder logic."
  },
  {
    title: "Time to First Signal",
    value: "7–14 days",
    description: "after system goes live",
    subtext: "Initial replies and qualified conversations indicate correct targeting."
  },
  {
    title: "Performance Improvement",
    value: "20–40%",
    description: "improvement in reply quality within 30–60 days",
    subtext: "As targeting, enrichment, and messaging compound."
  },
  {
    title: "Deliverability Health",
    value: "<2%",
    description: "bounce rate · <0.1% spam complaints",
    subtext: "Maintained through domain isolation and controlled sending."
  }
];

const ExpectedOutcomesSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">
        Expected Outcomes
      </h2>
      
      <p className="text-lg text-muted-foreground mb-10">
        What this system is designed to optimize for:
      </p>

      <ul className="space-y-2 text-foreground/80 mb-12">
        <li>• A consistent flow of buyer-ready outbound conversations</li>
        <li>• Clear signals around who is responding and why</li>
        <li>• Reduced no-shows through proper framing & reminders</li>
        <li>• Performance that improves over time as targeting and enrichment compound</li>
      </ul>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {kpis.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <p className="text-sm text-muted-foreground mb-2">{kpi.title}</p>
            <p className="text-2xl font-serif font-medium text-primary mb-1">
              {kpi.value} <span className="text-base font-sans text-foreground/70">{kpi.description}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-3">{kpi.subtext}</p>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground">
        This is not a "blast leads and pray" model. It is a system designed to create <strong className="text-foreground">reliable sales conversations</strong>, not vanity metrics.
      </p>
    </section>
  );
};

export default ExpectedOutcomesSection;
