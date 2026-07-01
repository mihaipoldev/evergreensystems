import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/home.css";
import "@/styles/insights.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { SEO_CONFIG, generatePageMetadata } from "@/lib/seo";

// PLACEHOLDER. An Insights / Playbook surface so the section exists to review.
// The posts below are placeholder copy, not real articles. Nothing links here
// from the main nav yet (open decision).
export const revalidate = 60;

const POSTS = [
  {
    tag: "Deliverability",
    title: "Why your main domain should never send",
    excerpt:
      "The reputation math behind separate sending domains, and the warmup window that makes or breaks inbox placement.",
    read: "6 min read",
  },
  {
    tag: "Targeting",
    title: "A list built around the buyer, not the tool",
    excerpt:
      "How we describe an ICP in plain terms and turn it into a verified, segmented list that actually replies.",
    read: "5 min read",
  },
  {
    tag: "Copy",
    title: "The cold email that books without pitching",
    excerpt:
      "Tension over features. The structure we use so a first email earns a reply instead of a delete.",
    read: "7 min read",
  },
  {
    tag: "Reply handling",
    title: "Every reply is a workflow, not an inbox",
    excerpt:
      "Reading, qualifying, and routing inbound so positive replies become booked calls, in your voice.",
    read: "4 min read",
  },
  {
    tag: "Metrics",
    title: "The one number that tells you outbound is working",
    excerpt:
      "Vanity metrics versus the qualified-call floor, and how to read a campaign in its first 90 days.",
    read: "6 min read",
  },
  {
    tag: "Infrastructure",
    title: "Warmup, explained without the myths",
    excerpt:
      "What a 2 to 3 week warmup actually does, and why skipping it cooks your reputation.",
    read: "5 min read",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Insights",
    description:
      "Operator-to-operator field notes on what actually books meetings: infrastructure, targeting, reply handling, and the metric that counts.",
    url: `${SEO_CONFIG.siteUrl}/insights`,
  });
}

export default function InsightsPage() {
  return (
    <div className={`eg-home ${egFontVars}`}>
      <ErrorBoundary>
        <SiteAnalytics pageSlug="insights" />
      </ErrorBoundary>

      <div className="ins-annc" data-analytics-section="insights-announce">
        <div className="wrap">
          <span>
            <b>The 90-day guarantee:</b>{" "}
            <span className="mut">10 qualified calls or every dollar back.</span>
          </span>
          <Link href="/#guarantee">See how it works</Link>
        </div>
      </div>

      <Navbar />

      <main>
        <section className="ins-hero" data-analytics-section="insights-hero">
          <div className="wrap">
            <div className="t-kicker eyebrow">The Playbook</div>
            <h1>
              <span className="em">Outbound,</span>{" "}
              <span className="dim">explained like a system.</span>
            </h1>
            <p className="ins-lead">
              Operator-to-operator field notes on what actually books meetings:
              infrastructure, targeting, reply handling, and the one metric that counts.
              No hacks. No blasting. Just the system.
            </p>
          </div>
        </section>

        <section className="ins-grid-sec" data-analytics-section="insights-list">
          <div className="wrap">
            <div className="ins-grid">
              {POSTS.map((p) => (
                <article className="ins-card" key={p.title}>
                  <div className="ins-card-tag">{p.tag}</div>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="ins-card-meta">{p.read}</div>
                </article>
              ))}
            </div>
            <p className="ins-note">Placeholder. Real articles coming soon.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
