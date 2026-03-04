const KPIsSection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">
        Typical KPIs You Should Expect
      </h2>

      <p className="text-muted-foreground mb-8">
        Exact results vary by offer, market, and sales execution. However, a healthy enriched outbound system is evaluated using a small set of clear performance indicators.
      </p>

      <h3 className="text-lg font-medium mb-4">Core KPIs We Track</h3>

      <div className="space-y-4 mb-10">
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
          <div>
            <p className="font-medium">Deliverability health</p>
            <p className="text-muted-foreground text-sm">Inbox placement, bounce rate, spam signals</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
          <div>
            <p className="font-medium">Reply quality</p>
            <p className="text-muted-foreground text-sm">Genuine replies vs noise, positive response rate</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
          <div>
            <p className="font-medium">Conversation quality</p>
            <p className="text-muted-foreground text-sm">Replies that meet qualification criteria</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
          <div>
            <p className="font-medium">Reply → call conversion</p>
            <p className="text-muted-foreground text-sm">Percentage of qualified conversations that book a call</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
          <div>
            <p className="font-medium">Call attendance</p>
            <p className="text-muted-foreground text-sm">Show-up rate for booked calls</p>
          </div>
        </div>
      </div>

      <p className="text-foreground/80 mb-8">
        Final revenue outcomes are driven by <strong>your ability to close</strong>, not by send volume.
      </p>

      <h3 className="text-lg font-medium mb-4">What the system is optimized for</h3>

      <ul className="space-y-2 text-foreground/80 ml-4">
        <li>• Reply quality over send volume</li>
        <li>• Call attendance over calendar spam</li>
        <li>• Consistent conversion over short-term spikes</li>
      </ul>

      <p className="text-muted-foreground mt-8">
        This is not a volume-based lead model. It is a conversation-quality system.
      </p>
    </section>
  );
};

export default KPIsSection;
