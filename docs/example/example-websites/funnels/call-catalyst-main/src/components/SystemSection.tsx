import { ArrowRight } from "lucide-react";

const systemSteps = [
  "ICP Research & Targeting",
  "Lead Sourcing + Deep Enrichment",
  "Controlled Sending Infrastructure",
  "Personalized Outreach System",
  "Replies Managed & Qualified",
  "Calls Booked to Your Calendar",
];

const SystemSection = () => {
  return (
    <section className="section-container section-spacing">
      <div className="max-w-4xl mx-auto">
        <h2 className="heading-lg mb-12 text-center">
          How the Enriched Outbound System Works
        </h2>

        {/* System Flow Diagram */}
        <div className="bg-secondary/30 rounded-xl p-6 md:p-8 border border-border mb-12">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {systemSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 md:gap-4">
                <div className="bg-background px-4 py-2.5 rounded-lg border border-border text-sm md:text-base font-medium text-foreground whitespace-nowrap">
                  {step}
                </div>
                {index < systemSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enrichment Explanation */}
        <div className="mb-12">
          <h3 className="heading-md mb-6">What "Enrichment" Actually Means</h3>
          <p className="body-md mb-6">
            We do not just identify companies or collect email addresses. Every prospect is processed through an enrichment layer that adds <span className="font-medium text-foreground">real, usable context</span> before any message is sent.
          </p>
          <ul className="space-y-3">
            {[
              "Role relevance & buying authority",
              "Company signals & positioning",
              "Publicly available data that supports personalization",
              "Context that allows emails to sound intentional, not automated",
            ].map((item, index) => (
              <li key={index} className="body-md flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="body-md mt-6">
            This ensures outreach is based on <span className="font-medium text-foreground">information</span>, not assumptions.
          </p>
        </div>

        {/* Sending Infrastructure */}
        <div className="mb-12">
          <h3 className="heading-md mb-6">How Emails Are Sent Safely and at Scale</h3>
          <p className="body-md mb-6">
            Enrichment alone is not enough if the sending setup is wrong. That is why the system is built with <span className="font-medium text-foreground">controlled sending and inbox-safe infrastructure</span> from day one.
          </p>
          <ul className="space-y-3">
            {[
              "Outreach is sent from dedicated secondary domains, not your main domain",
              "Each domain uses a small number of inboxes to keep sending behavior natural",
              "Sending volume is intentionally limited per inbox to protect reputation",
              "Domains and inboxes are warmed properly before campaigns go live",
              "Campaigns are centrally managed so replies, follow-ups, and stops are handled correctly",
            ].map((item, index) => (
              <li key={index} className="body-md flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="body-sm mt-6 p-4 bg-muted/50 rounded-lg">
            Inbox warmup exists because email providers do not trust new sending domains immediately. Sending too much volume too quickly from a new domain is one of the fastest ways to trigger spam filtering or permanently damage sender reputation.
          </p>
        </div>

        {/* Why This Matters */}
        <div className="bg-primary/5 rounded-xl p-6 md:p-8 border border-primary/10">
          <h3 className="heading-md mb-4">Why This Matters</h3>
          <p className="body-md mb-4">
            Most outbound fails for one of two reasons:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="body-md flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive/70" />
              Messages lack context, so prospects ignore them
            </li>
            <li className="body-md flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive/70" />
              Infrastructure is mismanaged, so messages never reach the inbox
            </li>
          </ul>
          <p className="body-md font-medium text-foreground">
            This system solves both. Enrichment improves reply quality. Controlled sending protects deliverability.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SystemSection;
