import { ArrowRight } from "lucide-react";

const steps = [
  "ICP Research & Targeting",
  "Lead Sourcing + Deep Enrichment",
  "Controlled Sending Infrastructure",
  "Personalized Outreach System",
  "Replies Managed & Qualified",
  "Calls Booked to Your Calendar",
];

const HowItWorksSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-3xl mx-auto">
        <h2 className="heading-section text-center mb-10">
          How the Enriched Outbound System Works
        </h2>

        {/* Process Flow */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="bg-secondary px-3 py-1.5 rounded-md text-sm font-medium text-foreground whitespace-nowrap">
                {step}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
              )}
            </div>
          ))}
        </div>

        {/* Enrichment Explanation */}
        <div className="card-subtle mb-6">
          <h3 className="heading-subsection mb-4">What "Enrichment" Actually Means</h3>
          <p className="text-body mb-4">
            We do not just identify companies or collect email addresses. Every prospect is processed through an enrichment layer that adds <strong className="text-foreground">real, usable context</strong> before any message is sent.
          </p>
          <ul className="list-checkmark">
            <li>Role relevance & buying authority</li>
            <li>Company signals & positioning</li>
            <li>Publicly available data that supports personalization</li>
            <li>Context that allows emails to sound intentional, not automated</li>
          </ul>
        </div>

        {/* Sending Explanation */}
        <div className="card-subtle mb-6">
          <h3 className="heading-subsection mb-4">How Emails Are Sent Safely and at Scale</h3>
          <p className="text-body mb-4">
            Enrichment alone is not enough if the sending setup is wrong. The system is built with <strong className="text-foreground">controlled sending and inbox-safe infrastructure</strong> from day one.
          </p>
          <ul className="list-checkmark">
            <li>Outreach sent from dedicated secondary domains, not your main domain</li>
            <li>Small number of inboxes per domain to keep sending behavior natural</li>
            <li>Volume intentionally limited per inbox to protect reputation</li>
            <li>Domains and inboxes warmed properly before campaigns go live</li>
            <li>Centrally managed so replies, follow-ups, and stops are handled correctly</li>
          </ul>
        </div>

        {/* Why This Matters */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
          <h3 className="heading-subsection mb-3">Why This Matters</h3>
          <p className="text-body mb-4">Most outbound fails for one of two reasons:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-3 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0 mt-2" />
              Messages lack context, so prospects ignore them
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0 mt-2" />
              Infrastructure is mismanaged, so messages never reach the inbox
            </li>
          </ul>
          <p className="text-body">
            <strong className="text-foreground">This system solves both.</strong> Enrichment improves reply quality. Controlled sending protects deliverability. Together, they create a system that can run continuously without collapsing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
