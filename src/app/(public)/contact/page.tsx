import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SHOW_DRAFTS } from "@/lib/drafts";
import "@/styles/home.css";
import "@/styles/contact.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { CtaLink } from "@/components/home/CtaLink";
import { Icon } from "@/components/home/icons";
import { ContactForm } from "@/components/contact/ContactForm";
import { SEO_CONFIG, generatePageMetadata } from "@/lib/seo";

// Contact page — ported from the Claude Design v3 export (site/contact.html)
// into the live `.eg-home` system. Server shell + a client ContactForm.
// Copy scrubbed to production rules (no em dashes; .ai email; our niches).
export const revalidate = 60;

const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Contact",
    description:
      "Get in touch with Evergreen Systems. Tell us what you're working through and you'll get a straight answer, even if it's no.",
    url: `${SEO_CONFIG.siteUrl}/contact`,
  });
}

export default function ContactPage() {
  // Dev-only until the capture backend exists — the form must never promise a
  // reply it can't deliver. Un-gate when form submissions actually reach Mihai.
  if (!SHOW_DRAFTS) notFound();
  return (
    <div className={`eg-home ${egFontVars}`}>
      <ErrorBoundary>
        <SiteAnalytics pageSlug="contact" />
      </ErrorBoundary>
      <div className="eg-grain" aria-hidden="true" />
      <Navbar />

      <div className="draft-note" role="status">
        Draft — hidden in production until the capture backend lands.
      </div>

      <main className="ct-main" data-analytics-section="contact">
        <div className="ct-grid">
          {/* LEFT — direct channels */}
          <div className="ct-left">
            <div className="ct-eyebrow">Contact</div>
            <h1 className="ct-h">
              Talk to a human, <span className="dim">not a funnel.</span>
            </h1>
            <p className="ct-lede">
              Tell us what you&apos;re working through. You&apos;ll get a straight answer, even if the
              honest one is &ldquo;outbound isn&apos;t right for you yet.&rdquo;
            </p>

            <div className="ct-channels">
              <CtaLink
                href={CALENDLY}
                entityId="contact-book-call"
                label="Book a call"
                location="contact-channels"
                className="ct-ch"
              >
                <span className="ct-ch-ic">
                  <Icon name="calendar" />
                </span>
                <span className="ct-ch-tx">
                  <b>Book a call</b>
                  <span>A 20-minute strategy call, direct with the founder.</span>
                  <span className="val">Pick a time →</span>
                </span>
              </CtaLink>

              <a
                className="ct-ch"
                href="mailto:hello@evergreensystems.ai"
                data-analytics-type="cta_button"
                data-analytics-id="contact-email"
                data-analytics-label="Email us"
              >
                <span className="ct-ch-ic">
                  <Icon name="mail" />
                </span>
                <span className="ct-ch-tx">
                  <b>Email us</b>
                  <span>Prefer to write? A real person replies.</span>
                  <span className="val">hello@evergreensystems.ai</span>
                </span>
              </a>

              <div className="ct-ch">
                <span className="ct-ch-ic">
                  <Icon name="clock" />
                </span>
                <span className="ct-ch-tx">
                  <b>Response time</b>
                  <span>We reply within one business day. No auto-sequences.</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — form */}
          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
