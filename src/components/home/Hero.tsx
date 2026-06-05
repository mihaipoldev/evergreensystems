import { home } from "@/features/home/content";
import { Icon } from "./icons";
import { TextureCanvas } from "./TextureCanvas";

// Hero + trust band. The dot-matrix "terrain" canvas is the one client island.
export function Hero() {
  const { hero, trust } = home;
  return (
    <section className="hero" id="top">
      <div className="hero-main">
        <div className="wrap hero-grid">
          <div>
            <div className="t-kicker eyebrow">{hero.eyebrow}</div>
            <h1>
              <span className="em">{hero.titleEm}</span>{" "}
              <span className="dim">{hero.titleDim}</span>
            </h1>
            <p className="lead">{hero.lead}</p>
            <div className="hero-actions">
              <a href={hero.cta.href} className="btn btn-solid">
                {hero.cta.label} <Icon name="arrow-right" />
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="blk" />
            <TextureCanvas tex="terrain" color="ink" step={7} animate speed={2.8} />
          </div>
        </div>
      </div>

      <div className="tband">
        <div className="wrap">
          {trust.map((ti, i) => (
            <div className="ti" key={i}>
              <Icon name={ti.icon} className="ic" />
              <div className="tx">
                {ti.link ? (
                  <>
                    {ti.prefix}
                    <a href={ti.link.href} target="_blank" rel="noopener noreferrer">
                      <b>{ti.link.label}</b>
                    </a>
                  </>
                ) : (
                  <>
                    <b>{ti.bold}</b> <span className="mut">{ti.muted}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
