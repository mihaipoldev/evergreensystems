import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOW_DRAFTS } from "@/lib/drafts";
import "@/styles/home.css";
import "@/styles/book.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { BookingWidget } from "@/components/book/BookingWidget";
import { SEO_CONFIG, generatePageMetadata } from "@/lib/seo";

// DESIGN ONLY. Ported from the Claude Design v2 book.html — a standalone
// booking page with its own minimal chrome. Nothing on the site links here
// yet, and the widget is not wired to a real scheduler; every live CTA still
// points to the current Calendly link until this page is production-ready.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Book a call",
    description:
      "Book a 20-minute strategy call with Evergreen Systems. Pick a time that works and we'll take it from there.",
    url: `${SEO_CONFIG.siteUrl}/book`,
  });
}

export default function BookPage() {
  // Dev-only: the widget isn't wired to a real scheduler — a visitor who found
  // this URL could "book" a call that doesn't exist. Un-gate when it's real.
  if (!SHOW_DRAFTS) notFound();
  return (
    <div className={`eg-home ${egFontVars} bk-page`}>
      <ErrorBoundary>
        <SiteAnalytics pageSlug="book" />
      </ErrorBoundary>
      <header className="bk-top">
        <div className="row">
          <div className="lft">
            <span className="ttl">Pick a time</span>
          </div>
          <Link className="brand" href="/" aria-label="Evergreen Systems">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/logos/evergreen-horizontal-navy.svg" alt="Evergreen Systems" />
          </Link>
        </div>
      </header>
      <BookingWidget />
    </div>
  );
}
