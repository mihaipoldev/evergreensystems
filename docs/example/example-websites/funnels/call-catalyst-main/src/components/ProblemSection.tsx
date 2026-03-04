const ProblemSection = () => {
  return (
    <section className="section-container section-spacing bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-lg mb-8 text-center">
          Why Traditional Lead Lists Fail in Real Sales Conversations
        </h2>

        <p className="body-md mb-6">Most "lead gen" looks like this:</p>

        <ul className="space-y-3 mb-8">
          {[
            "A list of emails",
            "Minimal context",
            "Generic personalization",
            "Low reply quality",
            "Endless back-and-forth before a real conversation",
          ].map((item, index) => (
            <li key={index} className="body-md flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive/70" />
              {item}
            </li>
          ))}
        </ul>

        <div className="bg-background rounded-xl p-6 md:p-8 border border-border mb-8">
          <p className="body-lg text-center font-medium text-foreground">
            You don't need more leads.
            <br />
            You need <span className="underline decoration-primary/30 underline-offset-4">better-informed leads</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/10">
            <p className="heading-sm mb-3">The Old Way:</p>
            <p className="body-md italic">
              "Here are 5,000 emails. Good luck closing."
            </p>
          </div>
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
            <p className="heading-sm mb-3">The Evergreen Way:</p>
            <p className="body-md italic">
              "Here are enriched prospects — with the exact data points needed to start real conversations."
            </p>
          </div>
        </div>

        <p className="body-lg text-center mt-8 font-medium text-foreground">
          This is the core difference.
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
