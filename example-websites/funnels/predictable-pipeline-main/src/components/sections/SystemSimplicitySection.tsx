const SystemSimplicitySection = () => {
  return (
    <section className="editorial-container">
      <h2 className="text-2xl md:text-3xl font-serif font-medium mb-6">
        How Complicated Is the System Once It Is Set Up?
      </h2>

      <p className="text-lg text-foreground/80 mb-6">
        It is intentionally simple on your side.
      </p>

      <p className="text-muted-foreground mb-4">Once live:</p>

      <ul className="space-y-2 text-foreground/80 mb-8 ml-4">
        <li>• Outreach runs continuously in the background</li>
        <li>• Replies are managed and filtered</li>
        <li>• Qualified conversations are booked directly to your calendar</li>
      </ul>

      <div className="space-y-2 text-foreground/80 mb-6">
        <p>You are not managing inboxes.</p>
        <p>You are not adjusting tools.</p>
        <p>You are not monitoring campaigns daily.</p>
      </div>

      <p className="text-lg font-medium">
        Your primary responsibility is to show up prepared and close conversations.
      </p>
    </section>
  );
};

export default SystemSimplicitySection;
