const WhyOutboundSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-8">
          Why Cold Outreach Still Works (When Done Right)
        </h2>

        <p className="text-body mb-6">There are three ways to acquire clients:</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-subtle text-center py-4">
            <p className="font-medium text-foreground">Content</p>
          </div>
          <div className="card-subtle text-center py-4">
            <p className="font-medium text-foreground">Advertising</p>
          </div>
          <div className="card-subtle text-center py-4 border-2 border-accent/30">
            <p className="font-medium text-foreground">Outbound</p>
          </div>
        </div>

        <p className="text-body mb-6">
          Most companies rely on the first two — and pay heavily for it.
        </p>

        <p className="text-body mb-6">
          <strong className="text-foreground">Outbound is different.</strong> You're not waiting for attention. You're initiating conversations directly with decision-makers.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {["Founders", "CEOs", "Operators", "Revenue owners"].map((role) => (
            <div key={role} className="bg-secondary/50 rounded-lg py-2 px-3 text-center">
              <span className="text-sm font-medium text-foreground">{role}</span>
            </div>
          ))}
        </div>

        <p className="text-body">
          At the <strong className="text-foreground">exact companies you want</strong>, with the <strong className="text-foreground">exact buyer context you need</strong>.
        </p>
      </div>
    </section>
  );
};

export default WhyOutboundSection;
