import { home } from "@/features/home/content";
import { SHOW_DRAFTS } from "@/lib/drafts";
import { CtaLink } from "./CtaLink";
import { Icon, LinkedInIcon } from "./icons";
import { TextureCanvas } from "./TextureCanvas";
import { EmailBookBar } from "./EmailBookBar";

export function ClosingCta() {
  const { close } = home;
  return (
    <section className="close" data-analytics-section="closing">
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
            {/* Email pill is dev-only until the capture backend exists; prod
                gets the plain tracked Growth Plan button. */}
            {SHOW_DRAFTS ? (
              <EmailBookBar lead="" />
            ) : (
              <CtaLink
                href={close.cta.href}
                entityId={close.cta.id}
                label={close.cta.label}
                location="closing"
                className="btn on-accent"
              >
                {close.cta.label} <Icon name="arrow-right" />
              </CtaLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
