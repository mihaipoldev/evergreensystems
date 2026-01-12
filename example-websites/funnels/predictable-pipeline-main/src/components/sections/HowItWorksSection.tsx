const steps = [
  "ICP Research & Targeting",
  "Lead Sourcing + Deep Enrichment",
  "Controlled Sending Infrastructure",
  "Personalized Outreach System",
  "Replies Managed & Qualified",
  "Calls Booked to Your Calendar"
];

const HowItWorksSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-10">
        How the Enriched Outbound System Works
      </h2>

      {/* System Flow */}
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex items-center gap-3">
                <span className="text-primary">→</span>
                <span className="text-sm md:text-base">{step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrichment Explanation */}
      <h3 className="text-xl font-serif font-medium mb-4">
        What "Enrichment" Actually Means
      </h3>
      
      <p className="text-foreground/80 mb-6">
        We do not just identify companies or collect email addresses. Every prospect is processed through an enrichment layer that adds <strong>real, usable context</strong> before any message is sent.
      </p>

      <ul className="space-y-2 text-foreground/80 mb-12 ml-4">
        <li>• Role relevance & buying authority</li>
        <li>• Company signals & positioning</li>
        <li>• Publicly available data that supports personalization</li>
        <li>• Context that allows emails to sound intentional, not automated</li>
      </ul>

      {/* Sending Infrastructure */}
      <h3 className="text-xl font-serif font-medium mb-4">
        How Emails Are Sent Safely and at Scale
      </h3>

      <p className="text-foreground/80 mb-6">
        Enrichment alone is not enough if the sending setup is wrong. That is why the system is built with <strong>controlled sending and inbox-safe infrastructure</strong> from day one.
      </p>

      <p className="text-muted-foreground mb-4">Here is how it works:</p>

      <ul className="space-y-2 text-foreground/80 mb-8 ml-4">
        <li>• Outreach is sent from <strong>dedicated secondary domains</strong>, not your main domain</li>
        <li>• Each domain uses a <strong>small number of inboxes</strong> to keep sending behavior natural</li>
        <li>• Sending volume is intentionally limited per inbox to protect reputation</li>
        <li>• Domains and inboxes are warmed properly before campaigns go live</li>
        <li>• Campaigns are centrally managed so replies, follow-ups, and stops are handled correctly</li>
      </ul>

      <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
        Inbox warmup exists because email providers do not trust new sending domains immediately. Sending too much volume too quickly from a new domain is one of the fastest ways to trigger spam filtering or permanently damage sender reputation. A controlled warmup period allows reputation to build gradually, so once campaigns go live, emails have a much higher chance of reaching real inboxes instead of spam.
      </p>

      <p className="text-foreground/80 mb-10">
        This prevents the most common failure in outbound: domains burning and messages landing in spam.
      </p>

      {/* Why This Matters */}
      <h3 className="text-xl font-serif font-medium mb-4">
        Why This Matters
      </h3>

      <p className="text-foreground/80 mb-6">
        Most outbound fails for one of two reasons:
      </p>

      <ul className="space-y-2 text-foreground/80 mb-8 ml-4">
        <li>• Messages lack context, so prospects ignore them</li>
        <li>• Infrastructure is mismanaged, so messages never reach the inbox</li>
      </ul>

      <p className="text-lg text-foreground mb-2">
        This system solves both.
      </p>

      <p className="text-foreground/80 mb-2">
        Enrichment improves <strong>reply quality</strong>.
      </p>
      
      <p className="text-foreground/80 mb-2">
        Controlled sending protects <strong>deliverability</strong>.
      </p>

      <p className="text-foreground/80">
        Together, they create a system that can run continuously without collapsing.
      </p>
    </section>
  );
};

export default HowItWorksSection;
