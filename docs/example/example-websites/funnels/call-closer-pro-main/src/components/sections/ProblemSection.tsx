const ProblemSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-8">
          Why Traditional Lead Lists Fail in Real Sales Conversations
        </h2>

        <p className="text-body mb-6">Most "lead gen" looks like this:</p>

        <ul className="space-y-2 mb-8">
          {[
            "A list of emails",
            "Minimal context",
            "Generic personalization",
            "Low reply quality",
            "Endless back-and-forth before a real conversation",
          ].map((item, index) => (
            <li key={index} className="flex items-center gap-3 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <p className="text-body mb-8">
          You don't need <em>more leads</em>. You need <strong className="text-foreground">better-informed leads</strong>.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="comparison-card opacity-60">
            <p className="text-sm font-medium text-muted-foreground mb-2">The Old Way</p>
            <p className="text-foreground italic">
              "Here are 5,000 emails. Good luck closing."
            </p>
          </div>
          <div className="comparison-card border-accent/30">
            <p className="text-sm font-medium text-accent mb-2">The Evergreen Way</p>
            <p className="text-foreground italic">
              "Here are enriched prospects — with the exact data points needed to start real conversations."
            </p>
          </div>
        </div>

        <p className="text-small text-center mt-6 font-medium">
          This is the core difference.
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
