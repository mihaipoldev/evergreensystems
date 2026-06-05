import { home } from "@/features/home/content";
import { Icon, LinkedInIcon } from "./icons";
import { TextureCanvas } from "./TextureCanvas";

export function ClosingCta() {
  const { close } = home;
  return (
    <section className="close">
      <TextureCanvas
        tex="field"
        color="on"
        dir="center"
        step={9}
        animate
        speed={2.8}
        className="cta-tex"
      />
      <div className="wrap">
        <div className="close-body">
          <div className="lead-col">
            <div className="close-pill">{close.pill}</div>
            <h2>{close.heading}</h2>
            <p>{close.sub}</p>
          </div>
          <div className="close-cta">
            <div className="founder-intro">
              <div className="founder-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={close.founder.avatar} alt={close.founder.avatarAlt} />
              </div>
              <div className="founder-text">
                <div className="founder-name">
                  {close.founder.name}
                  <a
                    href={close.founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${close.founder.name} on LinkedIn`}
                  >
                    <LinkedInIcon className="li" />
                  </a>
                </div>
                <div className="founder-line">{close.founder.line}</div>
              </div>
            </div>
            <a href={close.cta.href} className="btn on-accent">
              {close.cta.label} <Icon name="arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
