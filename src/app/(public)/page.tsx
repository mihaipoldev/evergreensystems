import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero'; // Keep Hero static - it's above the fold
import { AnalyticsTracker } from '@/components/landing/AnalyticsTracker';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Dynamic imports for below-fold components with loading states
const Logos = dynamic(() => import('@/components/landing/Logos').then(mod => ({ default: mod.Logos })), {
  loading: () => <div className="h-32" />,
});

const Offer = dynamic(() => import('@/components/landing/Offer').then(mod => ({ default: mod.Offer })), {
  loading: () => <div className="h-96" />,
});

const Results = dynamic(() => import('@/components/landing/Results').then(mod => ({ default: mod.Results })), {
  loading: () => <div className="h-96" />,
});

const FAQ = dynamic(() => import('@/components/landing/FAQ').then(mod => ({ default: mod.FAQ })), {
  loading: () => <div className="h-96" />,
});

const CTA = dynamic(() => import('@/components/landing/CTA').then(mod => ({ default: mod.CTA })), {
  loading: () => <div className="h-64" />,
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-64" />,
});

const Timeline = dynamic(() => import('@/components/landing/Timeline').then(mod => ({ default: mod.Timeline })), {
  loading: () => <div className="h-96" />,
});

import { createClient } from '@/lib/supabase/server';
import { getMediaById } from '@/features/media/queries';
import type { Metadata } from 'next';
import { SEO_CONFIG, generatePageMetadata, generateOrganizationSchema, generateServiceSchema, generateWebSiteSchema } from '@/lib/seo';

// Content-as-code: import content + adapter
import { homeContent } from '@/features/landing/content/home';
import {
  adaptHeader,
  adaptHero,
  adaptLogos,
  adaptOffer,
  adaptTimeline,
  adaptFAQ,
  adaptResults,
  adaptCTASection,
  adaptFooter,
  adaptSectionsForNavbar,
} from '@/features/landing/adapter';

// Enable ISR - revalidate every 1 minute (for styling options + media)
export const revalidate = 60;

// Generate dynamic metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    const title = SEO_CONFIG.homepageTitle;
    const description = SEO_CONFIG.homepageDescription;

    const metadata = generatePageMetadata({
      title: title,
      description: description,
      url: SEO_CONFIG.siteUrl,
      skipTitleTemplate: true,
    });

    return {
      ...metadata,
      other: {
        ...metadata.other,
        'dns-prefetch': 'https://fast.wistia.com, https://img.youtube.com, https://i.vimeocdn.com',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return generatePageMetadata({
      title: SEO_CONFIG.homepageTitle,
      description: SEO_CONFIG.homepageDescription,
      url: SEO_CONFIG.siteUrl,
      skipTitleTemplate: true,
    });
  }
}

export default async function LandingPage() {
  // ─── Remaining DB queries (styling + media only) ──────────
  const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';

  // Fetch styling options and hero media in parallel
  const supabase = await createClient();
  const [settingsResult, heroMedia] = await Promise.all([
    // Styling options (stays in DB — per-environment theming)
    (supabase.from("website_settings") as any)
      .select(`preset_id, website_settings_presets (styling_options)`)
      .eq("environment", environment)
      .eq("route", '/')
      .maybeSingle()
      .then((r: any) => r.data)
      .catch(() => null),
    // Hero video media (single query replacing 9 junction table joins)
    getMediaById(homeContent.hero.mainMediaId).catch(() => null),
  ]);

  // Parse styling options
  let dotsEnabled = false;
  let waveGradientEnabled = false;
  let noiseTextureEnabled = false;
  if (settingsResult?.website_settings_presets) {
    const preset = Array.isArray(settingsResult.website_settings_presets)
      ? settingsResult.website_settings_presets[0]
      : settingsResult.website_settings_presets;
    if (preset?.styling_options) {
      try {
        const stylingOptions = typeof preset.styling_options === 'string'
          ? JSON.parse(preset.styling_options)
          : preset.styling_options;
        dotsEnabled = stylingOptions?.dots_enabled === true;
        waveGradientEnabled = stylingOptions?.wave_gradient_enabled === true;
        noiseTextureEnabled = stylingOptions?.noise_texture_enabled === true;
      } catch {
        // defaults stay false
      }
    }
  }

  // ─── Adapt content for existing components ────────────────
  const header = adaptHeader(homeContent);
  const hero = adaptHero(homeContent, heroMedia);
  const logos = adaptLogos(homeContent);
  const offer = adaptOffer(homeContent);
  const timeline = adaptTimeline(homeContent);
  const faq = adaptFAQ(homeContent);
  const results = adaptResults(homeContent);
  const ctaSection = adaptCTASection(homeContent);
  const footer = adaptFooter(homeContent);
  const navSections = adaptSectionsForNavbar(homeContent);

  // ─── SEO structured data ──────────────────────────────────
  const organizationSchema = generateOrganizationSchema({
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.siteUrl,
  });
  const serviceSchema = generateServiceSchema();
  const websiteSchema = generateWebSiteSchema();

  // FAQ structured data from content
  const faqSchema = homeContent.faq.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": homeContent.faq.faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer,
      },
    })),
  } : null;

  return (
    <>
      {/* Structured Data for SEO */}
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
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden w-full">
        {/* Dot pattern at the top - fading at bottom */}
        {dotsEnabled && (
          <div className="absolute top-0 left-0 right-0 h-[1100px] pointer-events-none z-0">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--muted-foreground))_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 dark:opacity-15" />
              <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
          </div>
        )}

        {/* Unified background effects at the bottom */}
        {dotsEnabled && (
          <div className="absolute bottom-0 left-0 right-0 h-[1350px] pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background" />
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--muted-foreground))_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 dark:opacity-15" />
              <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-background via-background/80 to-transparent" />
            </div>
          </div>
        )}

        {/* Wave Gradient Background */}
        {waveGradientEnabled && (
          <div
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{
              background: `
                radial-gradient(ellipse 140% 70% at 50% 0%, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.08) 25%, hsl(var(--primary) / 0.04) 45%, transparent 70%),
                radial-gradient(ellipse 130% 65% at 50% 100%, hsl(var(--secondary) / 0.1) 0%, hsl(var(--secondary) / 0.06) 25%, hsl(var(--secondary) / 0.03) 45%, transparent 70%),
                radial-gradient(ellipse 110% 60% at 20% 50%, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.05) 30%, hsl(var(--primary) / 0.02) 50%, transparent 75%),
                radial-gradient(ellipse 115% 62% at 80% 50%, hsl(var(--secondary) / 0.06) 0%, hsl(var(--secondary) / 0.04) 30%, hsl(var(--secondary) / 0.02) 50%, transparent 75%)
              `,
            }}
          />
        )}

        {/* Noise Texture Overlay */}
        {noiseTextureEnabled && (
          <div
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{
              background: `
                repeating-linear-gradient(0deg, hsl(var(--foreground) / 0.08) 0px, transparent 0px, transparent 1px, hsl(var(--background) / 0.05) 1px, hsl(var(--background) / 0.05) 2px, transparent 2px, transparent 3px),
                repeating-linear-gradient(90deg, hsl(var(--foreground) / 0.06) 0px, transparent 0px, transparent 1px, hsl(var(--background) / 0.04) 1px, hsl(var(--background) / 0.04) 2px, transparent 2px, transparent 3px),
                repeating-linear-gradient(45deg, hsl(var(--foreground) / 0.04) 0px, transparent 0px, transparent 1px, hsl(var(--background) / 0.03) 1px, hsl(var(--background) / 0.03) 2px, transparent 2px, transparent 3px)
              `,
              backgroundSize: '3px 3px, 2px 2px, 4px 4px',
              opacity: 0.4,
            }}
          />
        )}

        <div className="relative z-[2]">
          <ErrorBoundary>
            <AnalyticsTracker
              pageId="home"
              pageSlug="home"
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <Navbar sections={navSections} headerSection={header.section} />
          </ErrorBoundary>
          <main className="w-full relative">
            <ErrorBoundary>
              <Hero section={hero.section} ctaButtons={hero.ctaButtons} />
            </ErrorBoundary>
            <ErrorBoundary>
              <Logos section={logos.section} softwares={logos.softwares} />
            </ErrorBoundary>
            <ErrorBoundary>
              <Offer section={offer.section} offerFeatures={offer.offerFeatures as any} waveGradientEnabled={waveGradientEnabled} />
            </ErrorBoundary>
            <ErrorBoundary>
              <Timeline section={timeline.section} {...({ timelineItems: timeline.timelineItems } as any)} />
            </ErrorBoundary>
            <ErrorBoundary>
              <FAQ faqs={faq.faqs} section={faq.section} waveGradientEnabled={waveGradientEnabled} />
            </ErrorBoundary>
            <ErrorBoundary>
              <Results section={results.section} />
            </ErrorBoundary>
            <ErrorBoundary>
              <CTA section={ctaSection.section} ctaButtons={ctaSection.ctaButtons} />
            </ErrorBoundary>
          </main>
          <ErrorBoundary>
            <Footer section={footer.section} socialPlatforms={footer.socialPlatforms as any} />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
