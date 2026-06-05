import { home } from "@/features/home/content";
import { renderEmphasis } from "./emphasis";

export function System() {
  const { system } = home;
  return (
    <section className="cred" id="system">
      <div className="wrap">
        <div className="shead">
          <div className="t-kicker eyebrow">{system.eyebrow}</div>
          <h2>
            <span className="em">{system.headingEm}</span>{" "}
            <span className="dim">{system.headingDim}</span>
          </h2>
        </div>

        <div className="sysrow">
          <div className="sysflow">
            {system.stages.map((s, i) => (
              <div className={`sysstage${s.end ? " is-end" : ""}`} key={i}>
                <div className="dot" />
                <div className="fk">{s.k}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <figure className="sysimg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={system.diagram.src} alt={system.diagram.alt} />
          </figure>
        </div>

        <div className="cred-specs">
          {system.specs.map((s, i) => (
            <span key={i}>{renderEmphasis(s)}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
