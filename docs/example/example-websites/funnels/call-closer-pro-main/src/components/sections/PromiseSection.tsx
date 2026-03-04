const PromiseSection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-4">
          Get Consistent, Qualified Sales Calls
        </h2>
        <p className="text-center text-xl font-medium text-foreground mb-8">
          At least 10 qualified sales calls within 30 days of the system going live
        </p>

        <ul className="list-checkmark space-y-1 mb-8">
          <li>Without spending tens of thousands on ads</li>
          <li>Without paying bloated retainers for "leads" that go nowhere</li>
          <li>Without managing tools, inboxes, follow-ups, or infrastructure</li>
        </ul>

        <div className="card-subtle text-center">
          <p className="text-body mb-2">
            <strong className="text-foreground">We build and run the entire outbound system for you — end-to-end.</strong>
          </p>
          <p className="text-small">
            You only show up to qualified calls booked directly on your calendar.
          </p>
        </div>

        <div className="mt-8 p-4 border-l-2 border-accent/50 bg-accent/5 rounded-r-lg">
          <p className="text-small">
            <span className="font-medium text-foreground">Note:</span> Only continue if you're a B2B founder or decision-maker with a clear offer and the ability to handle new sales conversations. This is not for experiments or short-term spikes — this is for founders who want a repeatable, system-driven acquisition channel.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromiseSection;
