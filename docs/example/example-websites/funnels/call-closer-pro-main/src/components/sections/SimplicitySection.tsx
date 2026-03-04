const SimplicitySection = () => {
  return (
    <section className="section-container">
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-section text-center mb-6">
          How Complicated Is the System Once It Is Set Up?
        </h2>

        <p className="text-body text-center mb-8">
          It is intentionally simple on your side.
        </p>

        <div className="card-subtle mb-6">
          <h3 className="heading-subsection mb-4">Once live:</h3>
          <ul className="list-checkmark">
            <li>Outreach runs continuously in the background</li>
            <li>Replies are managed and filtered</li>
            <li>Qualified conversations are booked directly to your calendar</li>
          </ul>
        </div>

        <div className="text-center text-muted-foreground space-y-1">
          <p>You are not managing inboxes.</p>
          <p>You are not adjusting tools.</p>
          <p>You are not monitoring campaigns daily.</p>
        </div>

        <p className="text-body text-center mt-6 font-medium text-foreground">
          Your primary responsibility is to show up prepared and close conversations.
        </p>
      </div>
    </section>
  );
};

export default SimplicitySection;
