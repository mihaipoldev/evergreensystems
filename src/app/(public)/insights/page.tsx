import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOW_DRAFTS, hasPublishedPosts } from "@/features/insights/posts";
import "@/styles/home.css";
import "@/styles/insights.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Icon } from "@/components/home/icons";
import { InsightsIndex } from "@/components/insights/InsightsIndex";
import { SEO_CONFIG, generatePageMetadata } from "@/lib/seo";

// Insights — the blog index, ported faithfully from the Claude Design v2
// playbook. Article content is placeholder; the article route is a follow-up.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Insights",
    description:
      "Operator-to-operator essays on building outbound as a system: infrastructure, targeting, reply handling, and the metric that actually counts, booked calls.",
    url: `${SEO_CONFIG.siteUrl}/insights`,
  });
}

export default function InsightsPage() {
  // While nothing is published, the whole Insights surface is dev-only.
  if (!SHOW_DRAFTS && !hasPublishedPosts) notFound();
  return (
    <div className={`eg-home ${egFontVars}`}>
      <ErrorBoundary>
        <SiteAnalytics pageSlug="insights" />
      </ErrorBoundary>

      <div className="topbar" data-analytics-section="insights-announce">
        <div className="wrap">
          <p>
            <b>The 90-day guarantee:</b> 10 qualified calls or every dollar back.
          </p>
          <Link href="/#guarantee">
            See how it works <Icon name="arrow-right" className="ic" />
          </Link>
        </div>
      </div>

      <Navbar />

      <main>
        <InsightsIndex />
        <div className="pre-close" />
        <ClosingCta />
      </main>

      <Footer />
    </div>
  );
}
