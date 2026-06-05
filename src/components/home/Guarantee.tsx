import { home } from "@/features/home/content";
import { renderEmphasis } from "./emphasis";
import { TextureCanvas } from "./TextureCanvas";

export function Guarantee() {
  const { guarantee } = home;
  return (
    <section className="guarantee" id="guarantee">
      <TextureCanvas
        tex="field"
        color="accent"
        dir="left"
        step={10}
        animate
        speed={2.8}
        className="gua-tex"
      />
      <div className="wrap">
        <div>
          <div className="t-kicker eyebrow">{guarantee.eyebrow}</div>
          <h2>{guarantee.heading}</h2>
        </div>
        <div>
          <div className="headline-num">{guarantee.num}</div>
          <p className="headline-sub">{guarantee.sub}</p>
          <ul className="gua-steps">
            {guarantee.steps.map((s, i) => (
              <li key={i}>
                <span className="num">{s.n}</span>
                <span>{renderEmphasis(s.text)}</span>
              </li>
            ))}
          </ul>
          <div className="gua-tags">
            {guarantee.tags.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
