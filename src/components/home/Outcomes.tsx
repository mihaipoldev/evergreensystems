import { home } from "@/features/home/content";

export function Outcomes() {
  const { outcomes } = home;
  return (
    <section id="outcomes">
      <div className="wrap">
        <div className="shead">
          <div className="t-kicker eyebrow">{outcomes.eyebrow}</div>
          <h2>
            <span className="em">{outcomes.headingEm}</span>{" "}
            <span className="dim">{outcomes.headingDim}</span>
          </h2>
        </div>
        <div className="outcomes-grid">
          {outcomes.items.map((o, i) => (
            <div className="outcome" key={i}>
              <div className={`n${o.accent ? " acc" : ""}`}>
                {o.num}
                <span className="u">{o.unit}</span>
              </div>
              <h3>{o.title}</h3>
              <p>{o.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
