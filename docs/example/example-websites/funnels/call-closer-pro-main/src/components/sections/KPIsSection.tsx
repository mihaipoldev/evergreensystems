const kpis = [
  {
    title: "Deliverability health",
    description: "Inbox placement, bounce rate, spam signals",
  },
  {
    title: "Reply quality",
    description: "Genuine replies vs noise, positive response rate",
  },
  {
    title: "Conversation quality",
    description: "Replies that meet qualification criteria",
  },
  {
    title: "Reply → call conversion",
    description: "Percentage of qualified conversations that book a call",
  },
  {
    title: "Call attendance",
    description: "Show-up rate for booked calls",
  },
];

const KPIsSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-3">
          Typical KPIs You Should Expect
        </h2>
        <p className="text-body text-center mb-8">
          Exact results vary by offer, market, and sales execution. However, a healthy enriched outbound system is evaluated using a small set of clear performance indicators.
        </p>

        <div className="mb-8">
          <h3 className="heading-subsection mb-4">Core KPIs We Track</h3>
          <div className="space-y-3">
            {kpis.map((kpi, index) => (
              <div key={index} className="flex items-start gap-4 py-3 border-b border-section-divider last:border-0">
                <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{kpi.title}</p>
                  <p className="text-small">{kpi.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-subtle">
          <h3 className="heading-subsection mb-3">What the system is optimized for</h3>
          <ul className="list-checkmark">
            <li>Reply quality over send volume</li>
            <li>Call attendance over calendar spam</li>
            <li>Consistent conversion over short-term spikes</li>
          </ul>
          <p className="text-small mt-4 italic">
            This is not a volume-based lead model. It is a conversation-quality system.
          </p>
        </div>
      </div>
    </section>
  );
};

export default KPIsSection;
