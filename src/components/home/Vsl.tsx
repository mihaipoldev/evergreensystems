import { home } from "@/features/home/content";

// Founder-video section. Built and styled, but NOT mounted in the live page
// yet — there is no video. When one exists, drop the placeholder frame for the
// real embed (e.g. Wistia) and render <Vsl /> in page.tsx.
export function Vsl() {
  const { vsl } = home;
  return (
    <section className="vsl" id="vsl" data-analytics-section="vsl">
      <div className="wrap">
        <div className="vsl-head">
          <div className="t-kicker eyebrow">{vsl.eyebrow}</div>
          <h2>
            <span className="em">{vsl.headingEm}</span>{" "}
            <span className="dim">{vsl.headingDim}</span>
          </h2>
        </div>
        <figure className="vsl-frame">
          {/* Placeholder until a real video exists. */}
          <div className="vsl-placeholder">Video coming soon</div>
        </figure>
        <p className="vsl-cap">{vsl.caption}</p>
      </div>
    </section>
  );
}
