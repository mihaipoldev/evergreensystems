import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/home.css";
import "@/styles/about.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { CtaLink } from "@/components/home/CtaLink";
import { Icon } from "@/components/home/icons";
import { SEO_CONFIG, generatePageMetadata } from "@/lib/seo";
import { SHOW_DRAFTS } from "@/lib/drafts";

// About / founder page — ported from the Claude Design v3 export
// (site/about.html) into the live `.eg-home` system. Static server component.
// Copy scrubbed to production rules (no em dashes; production CTA label).
export const revalidate = 60;

const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "About",
    description:
      "Why Mihai Pol built Evergreen Systems: outbound rebuilt as a system, run by the person who answers your email.",
    url: `${SEO_CONFIG.siteUrl}/about`,
  });
}

export default function AboutPage() {
  return (
    <div className={`eg-home ${egFontVars}`}>
      <ErrorBoundary>
        <SiteAnalytics pageSlug="about" />
      </ErrorBoundary>
      <div className="eg-grain" aria-hidden="true" />
      <Navbar />

      <main>
        {/* HERO */}
        <section className="ab-hero" data-analytics-section="about-hero">
          <div className="wrap ab-hero-in">
            <div className="ab-hero-copy">
              <div className="ab-eyebrow">About the founder</div>
              <h1 className="ab-h">
                <span className="em">The person who answers your email</span>{" "}
                <span className="dim">is the one who built the system.</span>
              </h1>
              <p className="ab-hero-sub">
                Evergreen is founder-run on purpose. No SDR handoff, no account-manager telephone
                game. You work directly with the operator who designed it.
              </p>
              <div className="ab-meta">
                <span>
                  <b>Mihai Pol</b> · Founder
                </span>
                <span>
                  <b>Builds:</b> outbound systems, done-for-you
                </span>
                <span>
                  <b>Based:</b> remote-first
                </span>
              </div>
            </div>
            <figure className="ab-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/mihai.png" alt="Mihai Pol, founder of Evergreen Systems" />
              <figcaption>
                <span className="nm">Mihai Pol</span>
                <span className="rl">Founder</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* PULL STATEMENT */}
        <section className="ab-pull" data-analytics-section="about-pull">
          <div className="wrap">
            <blockquote>
              &ldquo;I got tired of watching good companies burn their domains on the{" "}
              <span className="ac">blast.</span> So I built the system instead.&rdquo;
            </blockquote>
          </div>
        </section>

        {/* STORY */}
        <section className="ab-story" data-analytics-section="about-story">
          <div className="wrap ab-story-in">
            <div className="lbl">The why</div>
            <div className="body">
              <p>
                Most outbound fails the same way. A company with a real offer buys a list, plugs it
                into a stock sending tool, and blasts ten thousand merge-tag emails from their main
                domain. Replies trickle in, a few bounce, and within a month the inbox they depend
                on is landing in spam. The verdict they walk away with,{" "}
                <strong>&ldquo;cold email doesn&apos;t work,&rdquo;</strong> is the wrong lesson from
                the right pain.
              </p>
              <p>
                I kept seeing it from the inside. The problem was never the channel. It was that
                everyone treated a booked calendar as an act of <em>sending</em> instead of the
                output of a <strong>system</strong>: authenticated infrastructure, targeting built
                on real data, and replies worked by a human who actually cares whether the meeting
                happens.
              </p>
              <p>
                So Evergreen isn&apos;t an agency that blasts on your behalf, and it isn&apos;t
                another tool for your team to babysit. It&apos;s the whole system, built and run for
                you: <strong>infrastructure, targeting, reply handling, automation</strong>, the four
                moves between a cold list and a call on your calendar.
              </p>
              <p>
                I keep it founder-run for one reason: the person who designs the system should be the
                one accountable for it. When you email Evergreen, you get me, not a ticket queue.
              </p>
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section className="ab-principles" data-analytics-section="about-principles">
          <div className="wrap">
            <h2 className="ab-sec-h">
              How I work, <span className="dim">and what I won&apos;t do.</span>
            </h2>
            <div className="pr-grid">
              <div className="pr">
                <div className="n">01</div>
                <h3>Booked, not sent</h3>
                <p>
                  Opens and &ldquo;activity&rdquo; are vanity. The only number that counts is calls
                  on your calendar, measured, not assumed.
                </p>
              </div>
              <div className="pr">
                <div className="n">02</div>
                <h3>Honest over impressive</h3>
                <p>
                  If outbound isn&apos;t right for you yet, I&apos;ll tell you. No representative
                  number ever gets sold as a real one.
                </p>
              </div>
              <div className="pr">
                <div className="n">03</div>
                <h3>Systems over blasts</h3>
                <p>
                  Your domains are an asset. I&apos;d rather send less to the right buyer than burn
                  your reputation for volume.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="ab-cta" data-analytics-section="about-cta">
          <div className="wrap ab-cta-in">
            <div>
              <h2>Want to talk to the person, not the pipeline?</h2>
              <p>
                Get your free Growth Plan on a 20-minute call, direct with me. Worst case, you leave
                with a sharper strategy.
              </p>
            </div>
            <div className="ab-cta-actions">
              <CtaLink
                href={CALENDLY}
                entityId="about-cta-growth-plan"
                label="Get your free Growth Plan"
                location="about-cta"
                className="ab-btn solid"
              >
                Get your free Growth Plan{" "}
                <Icon name="arrow-right" />
              </CtaLink>
              {/* /contact is dev-only until the capture backend exists. */}
              {SHOW_DRAFTS && (
                <Link
                  href="/contact"
                  className="ab-btn ghost"
                  data-analytics-type="cta_button"
                  data-analytics-id="about-cta-contact"
                  data-analytics-label="Send a message"
                >
                  Send a message
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
