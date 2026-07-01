import { home } from "@/features/home/content";
import { PlatformCarousel } from "./PlatformCarousel";
import { TextureCanvas } from "./TextureCanvas";

export function Platform() {
  const { platform } = home;
  return (
    <section className="platform" id="platform">
      <TextureCanvas
        tex="field"
        color="ink"
        dir="up"
        step={12}
        animate
        speed={2.8}
        className="plat-tex"
      />
      <div className="wrap">
        <div className="platform-row">
          <div className="platform-copy">
            <div className="t-kicker eyebrow">{platform.eyebrow}</div>
            <h2>
              <span className="em">{platform.headingEm}</span>{" "}
              <span className="dim">{platform.headingDim}</span>
            </h2>
            <p className="lead" style={{ fontSize: "var(--fs-body)", margin: "22px 0 30px" }}>
              {platform.lead}
            </p>
            <ul className="platform-pts">
              {platform.points.map((p, i) => (
                <li key={i}>
                  <span className="dot-acc" />
                  <div>
                    <b>{p.bold}</b> {p.rest}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <PlatformCarousel screenshots={platform.screenshots} />
        </div>
      </div>
    </section>
  );
}
