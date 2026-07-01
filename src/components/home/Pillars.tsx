import { home } from "@/features/home/content";
import { Icon } from "./icons";

// Four Pillars — alternating editorial rows: pillar copy (from content) beside
// a mock product visual. The visuals are decorative sample data keyed by index
// (no real infra claims — copy stays on the production "scaled to your target"
// discipline). Server component.

function PillarViz({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="pv pv-infra">
        <div className="pv-head">
          <span className="lab">
            <b>01</b> · Infrastructure
          </span>
          <span className="st">Domains warmed</span>
        </div>
        <div className="pv-body">
          <div className="pv-rows">
            <div className="pv-row">
              <div className="dm">
                outbound.<span className="mut">yourco-hq.com</span>
              </div>
              <div className="pv-bar">
                <i style={{ width: "100%" }} />
              </div>
            </div>
            <div className="pv-row">
              <div className="dm">
                mail.<span className="mut">yourco-team.com</span>
              </div>
              <div className="pv-bar">
                <i style={{ width: "100%" }} />
              </div>
            </div>
            <div className="pv-row">
              <div className="dm">
                hello.<span className="mut">yourco-reach.com</span>
              </div>
              <div className="pv-bar">
                <i style={{ width: "96%" }} />
              </div>
            </div>
            <div className="pv-row">
              <div className="dm">
                go.<span className="mut">yourco-mail.com</span>
              </div>
              <div className="pv-bar">
                <i style={{ width: "88%" }} />
              </div>
            </div>
            <div className="pv-row">
              <div className="dm">
                <span className="mut">+ more domains, scaled to your target</span>
              </div>
              <div className="pv-bar">
                <i style={{ width: "72%" }} />
              </div>
            </div>
          </div>
          <div className="pv-callout">
            {"Your "}
            <b>main domain</b>
            {" never sends. Cooked reputation isn't an option."}
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    const leads = [
      { who: "Dana Whitmore", meta: "· VP Growth · Northwind" },
      { who: "Marcus Reyes", meta: "· Founder · Latchpoint" },
      { who: "Priya Nandan", meta: "· Head of Sales · Cobalt" },
      { who: "Sam Iverson", meta: "· CEO · Fieldwork" },
    ];
    return (
      <div className="pv pv-target">
        <div className="pv-head">
          <span className="lab">
            <b>02</b> · Targeting
          </span>
          <span className="st">Verified</span>
        </div>
        <div className="pv-body">
          <div className="pv-search">
            <Icon name="search" />
            Decision-makers at your ICP
          </div>
          {leads.map((l) => (
            <div className="pv-lead" key={l.who}>
              <div className="who">
                <b>{l.who}</b> <span>{l.meta}</span>
              </div>
              <span className="pv-tag">Verified</span>
            </div>
          ))}
          <div className="pv-callout">Matched, enriched, and segmented by intent.</div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="pv pv-reply">
        <div className="pv-head">
          <span className="lab">
            <b>03</b> · Reply handling
          </span>
          <span className="st">Worked by us</span>
        </div>
        <div className="pv-body">
          <div className="pv-thread">
            <div className="pv-reply-card">
              <div className="rh">
                <b>Re: quick question</b>
                <span className="pv-pill int">Interested</span>
              </div>
              <div className="rt">
                {'"Yeah, worth a look. What does next week look like?"'}
              </div>
            </div>
            <div className="pv-reply-card">
              <div className="rh">
                <b>Re: hiring this quarter</b>
                <span className="pv-pill int">Interested</span>
              </div>
              <div className="rt">{'"Send a time, Tuesday AM ideally."'}</div>
            </div>
            <div className="pv-reply-card">
              <div className="rh">
                <b>Re: outbound for Acme</b>
                <span className="pv-pill rou">Routed</span>
              </div>
              <div className="rt">Objection handled in your voice, then booked.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // index === 3 — Automation: mini calendar week
  const week = [
    { d: "Mon", slots: [false, true, false] },
    { d: "Tue", slots: [true, false, true] },
    { d: "Wed", slots: [false, true, false] },
    { d: "Thu", slots: [true, false, true] },
    { d: "Fri", slots: [false, true, false] },
  ];
  return (
    <div className="pv pv-auto">
      <div className="pv-head">
        <span className="lab">
          <b>04</b> · Automation
        </span>
        <span className="st">Synced to CRM</span>
      </div>
      <div className="pv-body">
        <div className="pv-cal">
          {week.map((day) => (
            <div className="pv-day" key={day.d}>
              <div className="dl">{day.d}</div>
              <div className="slots">
                {day.slots.map((booked, i) => (
                  <span className={`pv-slot${booked ? " book" : ""}`} key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pv-cal-foot">
          <Icon name="calendar-check" /> Qualified calls land on your calendar, with a
          pre-call brief.
        </div>
      </div>
    </div>
  );
}

export function Pillars() {
  const { pillars } = home;
  return (
    <section className="pillars" id="pillars" data-analytics-section="pillars">
      <div className="wrap">
        <div className="shead">
          <div className="t-kicker eyebrow">{pillars.eyebrow}</div>
          <h2>
            <span className="em">{pillars.headingEm}</span>{" "}
            <span className="dim">{pillars.headingDim}</span>
          </h2>
        </div>

        <div className="pillar-rows">
          {pillars.items.map((p, i) => (
            <div className={`pillar-row${i % 2 === 1 ? " is-flip" : ""}`} key={p.k}>
              <div className="pillar-copy">
                <div className="p-k">
                  <span className="mk">{p.k}</span> {p.label}
                </div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <ul>
                  {p.points.map((pt, j) => (
                    <li key={j}>
                      <span className="pd" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pillar-viz">
                <PillarViz index={i} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
