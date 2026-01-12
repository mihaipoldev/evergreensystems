const ProblemSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-8">
        Why Traditional Lead Lists Fail in Real Sales Conversations
      </h2>

      <p className="text-lg text-muted-foreground mb-6">
        Most "lead gen" looks like this:
      </p>

      <ul className="space-y-2 text-foreground/80 mb-10 ml-4">
        <li>• A list of emails</li>
        <li>• Minimal context</li>
        <li>• Generic personalization</li>
        <li>• Low reply quality</li>
        <li>• Endless back-and-forth before a real conversation</li>
      </ul>

      <p className="text-xl text-foreground mb-6">
        You don't need <em>more leads</em>.
      </p>

      <p className="text-xl text-foreground font-medium mb-10">
        You need <strong>better-informed leads</strong>.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">The Old Way:</p>
          <p className="text-foreground/80 italic">
            "Here are 5,000 emails. Good luck closing."
          </p>
        </div>
        
        <div className="bg-accent/30 rounded-lg p-6 border border-primary/20">
          <p className="text-sm text-primary mb-2">The Evergreen Way:</p>
          <p className="text-foreground/90 italic">
            "Here are enriched prospects — with the exact data points needed to start real conversations."
          </p>
        </div>
      </div>

      <p className="text-lg text-center text-muted-foreground mt-8">
        This is the core difference.
      </p>
    </section>
  );
};

export default ProblemSection;
