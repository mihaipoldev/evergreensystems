import { home } from "@/features/home/content";
import { Icon } from "./icons";
import { TextureCanvas } from "./TextureCanvas";

export function Niches() {
  const { niches } = home;
  return (
    <section id="niches">
      <TextureCanvas
        tex="field"
        color="ink"
        dir="right"
        step={8}
        animate
        speed={2.8}
        className="niche-tex"
      />
      <div className="wrap">
        <div className="shead">
          <div className="t-kicker eyebrow">{niches.eyebrow}</div>
          <h2>
            {niches.headingBefore}
            <span className="dim">{niches.headingDim}</span>
            {niches.headingAfter}
          </h2>
          <p>{niches.lead}</p>
        </div>

        <div className="niche-grid">
          {niches.items.map((n, i) =>
            n.live && n.href ? (
              <a className="niche live" href={n.href} key={i}>
                <div>
                  <div className="label">{n.label}</div>
                  <div className="meta">{n.meta}</div>
                </div>
                <span className="go">
                  <Icon name="arrow-right" />
                </span>
              </a>
            ) : (
              <div className="niche soon" key={i}>
                <div>
                  <div className="label">{n.label}</div>
                  <div className="meta">{n.meta}</div>
                </div>
                <span className="go">
                  <Icon name="clock" />
                </span>
              </div>
            ),
          )}
        </div>

        <p className="niche-foot">
          {niches.foot.text}
          <a href={niches.foot.linkHref} target="_blank" rel="noopener noreferrer">
            {niches.foot.linkLabel}
          </a>
          {niches.foot.tail}
        </p>
      </div>
    </section>
  );
}
