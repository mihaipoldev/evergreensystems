import type { Metadata } from "next";
import "@/styles/home.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";

// New homepage — rebuilt from the Claude Design export
// (design/v1-2026-06-05/project/site/index.html). The whole design lives in
// the `.eg-home` scope so its tokens never leak into the rest of the app.
import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { Platform } from "@/components/home/Platform";
import { Outcomes } from "@/components/home/Outcomes";
import { Calculator } from "@/components/home/Calculator";
import { Guarantee } from "@/components/home/Guarantee";
import { Pricing } from "@/components/home/Pricing";
import { Niches } from "@/components/home/Niches";
import { Faq } from "@/components/home/Faq";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Footer } from "@/components/home/Footer";
import { HomeMotion } from "@/components/home/HomeMotion";
import { GetInTouch } from "@/components/home/GetInTouch";
import { ExitIntentModal } from "@/components/home/ExitIntentModal";
import { Pillars } from "@/components/home/Pillars";
import { Vsl } from "@/components/home/Vsl";
import { home } from "@/features/home/content";
import { SHOW_DRAFTS } from "@/lib/drafts";

import {
  SEO_CONFIG,
  generatePageMetadata,
  generateOrganizationSchema,
  generateServiceSchema,
  generateWebSiteSchema,
} from "@/lib/seo";

export const revalidate = 60;

// Founder video is designed but not live yet (no video). Flip to true to show it.
const SHOW_VSL = false;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Evergreen Systems — Outbound systems that book qualified sales calls";
  const description =
    "Done-for-you outbound systems for B2B. We build and run the infrastructure, targeting, and reply handling that books qualified sales calls — guaranteed, or your retainer back.";
  return generatePageMetadata({
    title,
    description,
    url: SEO_CONFIG.siteUrl,
    skipTitleTemplate: true,
  });
}

export default function HomePage() {
  const organizationSchema = generateOrganizationSchema({
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.siteUrl,
  });
  const serviceSchema = generateServiceSchema();
  const websiteSchema = generateWebSiteSchema();
  const faqSchema =
    home.faq.items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: home.faq.items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className={`eg-home ${egFontVars}`}>
        <ErrorBoundary>
          <SiteAnalytics pageSlug="home" />
        </ErrorBoundary>
        <HomeMotion />
        <div className="eg-grain" aria-hidden="true" />
        <Navbar />
        <main>
          <Hero />
          {/* Founder video — built but hidden until a real video exists. */}
          {SHOW_VSL && <Vsl />}
          <Platform />
          <Outcomes />
          <Calculator />
          <Pillars />
          <Guarantee />
          <Pricing />
          <Faq />
          <Niches />
          {/* Capture surfaces are dev-only until the backend exists — a form
              that promises a reply and saves nothing must not ship. */}
          {SHOW_DRAFTS && <GetInTouch />}
          <ClosingCta />
        </main>
        <Footer />
        {SHOW_DRAFTS && <ExitIntentModal />}
      </div>
    </>
  );
}
