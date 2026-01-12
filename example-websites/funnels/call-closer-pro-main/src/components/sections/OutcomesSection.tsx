const benchmarks = [
  {
    label: "Reply Quality",
    value: "8–15%",
    description: "of replies are context-aware, human responses — not auto-responses or unsubscribes.",
  },
  {
    label: "Conversation to Call",
    value: "25–40%",
    description: "of qualified conversations book a call, measured after fit checks and intent validation.",
  },
  {
    label: "Call Show-Up Rate",
    value: "75–90%",
    description: "attendance on booked calls, driven by proper framing, confirmation, and reminder logic.",
  },
  {
    label: "Time to First Signal",
    value: "7–14 days",
    description: "after system goes live — initial replies and qualified conversations indicate correct targeting.",
  },
  {
    label: "Performance Improvement",
    value: "20–40%",
    description: "improvement in reply quality within 30–60 days as targeting, enrichment, and messaging compound.",
  },
  {
    label: "Deliverability Health",
    value: "<2% bounce",
    description: "rate with <0.1% spam complaints, maintained through domain isolation and controlled sending.",
  },
];

const OutcomesSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-section text-center mb-3">Expected Outcomes</h2>
        <p className="text-body text-center mb-10">
          What this system is designed to optimize for:
        </p>

        <ul className="list-checkmark mb-10">
          <li>A consistent flow of buyer-ready outbound conversations</li>
          <li>Clear signals around who is responding and why</li>
          <li>Reduced no-shows through proper framing & reminders</li>
          <li>Performance that improves over time as targeting and enrichment compound</li>
        </ul>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchmarks.map((item, index) => (
            <div key={index} className="kpi-card">
              <p className="kpi-label">{item.label}</p>
              <p className="kpi-value">{item.value}</p>
              <p className="kpi-description">{item.description}</p>
            </div>
          ))}
        </div>

        <p className="text-small text-center mt-8 italic">
          This is not a "blast leads and pray" model. It is a system designed to create reliable sales conversations, not vanity metrics.
        </p>
      </div>
    </section>
  );
};

export default OutcomesSection;
