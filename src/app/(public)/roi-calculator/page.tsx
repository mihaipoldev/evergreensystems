import type { Metadata } from "next";
import "@/styles/home.css";
import { egFontVars } from "@/components/home/fonts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Navbar } from "@/components/home/Navbar";
import { Calculator } from "@/components/home/Calculator";
import { Footer } from "@/components/home/Footer";
import { SEO_CONFIG, generatePageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Outbound ROI Calculator",
    description:
      "See what an outbound system would put in your pipeline — booked calls, new clients, and the revenue you're leaving on the table every month. Free, no signup.",
    url: `${SEO_CONFIG.siteUrl}/roi-calculator`,
  });
}

export default function RoiCalculatorPage() {
  return (
    <div className={`eg-home ${egFontVars}`}>
      <ErrorBoundary>
        <SiteAnalytics pageSlug="roi-calculator" />
      </ErrorBoundary>
      <Navbar />
      <main>
        <Calculator />
      </main>
      <Footer />
    </div>
  );
}
