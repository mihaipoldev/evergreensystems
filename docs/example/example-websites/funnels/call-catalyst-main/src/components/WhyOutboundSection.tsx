const WhyOutboundSection = () => {
  return (
    <section className="section-container section-spacing">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-lg mb-8 text-center">
          Why Cold Outreach Still Works (When Done Right)
        </h2>

        <p className="body-md mb-8">
          There are three ways to acquire clients:
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {["Content", "Advertising", "Outbound"].map((method, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg text-center font-medium ${
                index === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {method}
            </div>
          ))}
        </div>

        <p className="body-md mb-6">
          Most companies rely on the first two — and pay heavily for it.
        </p>

        <p className="body-md mb-6">
          Outbound is different. You're not waiting for attention. You're <span className="font-medium text-foreground">initiating conversations directly with decision-makers</span>.
        </p>

        <ul className="space-y-2 mb-8">
          {["Founders", "CEOs", "Operators", "Revenue owners"].map((role, index) => (
            <li key={index} className="body-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {role}
            </li>
          ))}
        </ul>

        <p className="body-lg text-foreground font-medium text-center">
          At the exact companies you want, with the exact buyer context you need.
        </p>
      </div>
    </section>
  );
};

export default WhyOutboundSection;
