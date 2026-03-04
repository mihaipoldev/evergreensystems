const sections = [
  "Expected outcomes",
  "Why Cold Outreach Still Works (When Done Right)",
  "Why Traditional Lead Lists Fail",
  "How the Enriched Outbound System Works",
  "Typical KPIs You Should Expect",
  "What You Get Done For You",
  "Why This Model Makes Sense",
  "How the System Runs Once Live",
  "Timeline: How This Goes Live",
  "Pricing",
  "Performance Guarantee",
  "Frequently Asked Questions",
  "Ready to Start Getting Qualified Calls?"
];

const TableOfContents = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-lg font-medium text-muted-foreground mb-4">Table of contents</h2>
      <nav>
        <ul className="space-y-2">
          {sections.map((section, index) => (
            <li key={index}>
              <span className="text-sm text-foreground/70 hover:text-foreground cursor-pointer transition-colors">
                {section}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};

export default TableOfContents;
