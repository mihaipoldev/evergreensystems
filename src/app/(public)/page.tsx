import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero'; // Keep Hero static - it's above the fold
import { AnalyticsTracker } from '@/components/landing/AnalyticsTracker';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AnimatedGlowOrbs } from '@/components/landing/AnimatedGlowOrbs';

// Dynamic imports for below-fold components with loading states
const Logos = dynamic(() => import('@/components/landing/Logos').then(mod => ({ default: mod.Logos })), {
  loading: () => <div className="h-32" />, // Placeholder height
});

const Stories = dynamic(() => import('@/components/landing/Stories').then(mod => ({ default: mod.Stories })), {
  loading: () => <div className="h-96" />,
});

const Value = dynamic(() => import('@/components/landing/Value').then(mod => ({ default: mod.Value })), {
  loading: () => <div className="h-96" />,
});

const Offer = dynamic(() => import('@/components/landing/Offer').then(mod => ({ default: mod.Offer })), {
  loading: () => <div className="h-96" />,
});

const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then(mod => ({ default: mod.Testimonials })), {
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

const Header = dynamic(() => import('@/components/landing/Header').then(mod => ({ default: mod.Header })), {
  loading: () => <div className="h-32" />,
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-64" />,
});

const Timeline = dynamic(() => import('@/components/landing/Timeline').then(mod => ({ default: mod.Timeline })), {
  loading: () => <div className="h-96" />,
});

const Performance = dynamic(() => import('@/components/landing/Performance').then(mod => ({ default: mod.Performance })), {
  loading: () => <div className="h-96" />,
});
import { getActivePageBySlug } from '@/features/page-builder/pages/queries';
import { getVisibleSectionsByPageId } from '@/features/page-builder/sections/queries';
import { shouldIncludeItemByStatus } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import type { CTAButtonWithSection } from '@/features/page-builder/cta/types';
import type { MediaWithSection } from '@/features/page-builder/media/types';
import type { Metadata } from 'next';
import { SEO_CONFIG, generatePageMetadata, generateOrganizationSchema, generateServiceSchema, generateWebSiteSchema } from '@/lib/seo';

// Enable ISR - revalidate every 1 minute
export const revalidate = 60;

// Section type definition
type Section = {
  id: string;
  type: string;
  title: string | null;
  admin_title: string | null;
  header_title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
  media_url: string | null;
  page_section_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
  media?: MediaWithSection[];
  ctaButtons?: CTAButtonWithSection[];
  features?: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    icon: string | null;
    position: number;
    created_at: string;
    updated_at: string;
    section_feature: {
      id: string;
      position: number;
      status: "published" | "draft" | "deactivated";
      created_at: string;
    };
  }>;
  faqItems?: Array<{
    id: string;
    question: string;
    answer: string;
    position: number;
    created_at: string;
    updated_at: string;
    section_faq_item: {
      id: string;
      position: number;
      status: "published" | "draft" | "deactivated";
      created_at: string;
    };
  }>;
  timelineItems?: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    badge: string | null;
    icon: string | null;
    position: number;
    created_at: string;
    updated_at: string;
    section_timeline: {
      id: string;
      position: number;
      status?: "published" | "draft" | "deactivated";
      created_at: string;
    };
  }>;
  testimonials?: Array<{
    id: string;
    author_name: string;
    author_role: string | null;
    company_name: string | null;
    headline: string | null;
    quote: string | null;
    avatar_url: string | null;
    rating: number | null;
    position: number;
    created_at: string;
    updated_at: string;
    section_testimonial: {
      id: string;
      position: number;
      status?: "published" | "draft" | "deactivated";
      created_at: string;
    };
  }>;
  results?: Array<{
    id: string;
    content: any;
    position: number;
    created_at: string;
    updated_at: string;
    section_result: {
      id: string;
      position: number;
      status?: "published" | "draft" | "deactivated";
      created_at: string;
    };
  }>;
  softwares?: Array<{
    id: string;
    name: string;
    slug: string;
    website_url: string;
    icon: string | null;
    created_at: string;
    updated_at: string;
    section_software: {
      id: string;
      order: number;
      icon_override: string | null;
      status?: "published" | "draft" | "deactivated";
      created_at: string;
    };
  }>;
  socialPlatforms?: Array<{
    id: string;
    name: string;
    icon: string | null;
    base_url: string | null;
    created_at: string;
    updated_at: string;
    section_social: {
      id: string;
      order: number;
      status?: "published" | "draft" | "deactivated";
      created_at: string;
    };
  }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Use homepage-specific title and description
    const title = SEO_CONFIG.homepageTitle;
    const description = SEO_CONFIG.homepageDescription;

    // Generate comprehensive metadata with skipTitleTemplate to use exact title
    const metadata = generatePageMetadata({
      title: title,
      description: description,
      url: SEO_CONFIG.siteUrl,
      skipTitleTemplate: true, // Use exact title without appending site name
    });

    // Add DNS prefetch for external resources
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

type LandingPageProps = {
  searchParams?: Promise<Record<string, string>> | Record<string, string>;
};

export default async function LandingPage({ searchParams }: LandingPageProps) {
  // Handle both Promise and direct object for searchParams (Next.js compatibility)
  const params = searchParams instanceof Promise ? await searchParams : (searchParams || {});

  // Parallelize all database queries for better performance
  // Note: Features, FAQ items, testimonials, timeline items, and results are now fetched per-section via getVisibleSectionsByPageId
  
  // Determine environment based on NODE_ENV
  const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';
  
  // Get website settings with preset to fetch styling_options
  const supabase = await createClient();
  let dotsEnabled = true; // Default to true if not found
  let waveGradientEnabled = false; // Default to false if not found
  let noiseTextureEnabled = false; // Default to false if not found
  try {
    const { data: settings } = await (supabase
      .from("website_settings") as any)
      .select(`
        preset_id,
        website_settings_presets (
          styling_options
        )
      `)
      .eq("environment", environment)
      .maybeSingle();

    // Extract styling_options from preset
    if (settings?.website_settings_presets) {
      const preset = Array.isArray(settings.website_settings_presets) 
        ? settings.website_settings_presets[0] 
        : settings.website_settings_presets;
      
      if (preset?.styling_options) {
        try {
          const stylingOptions = typeof preset.styling_options === 'string' 
            ? JSON.parse(preset.styling_options) 
            : preset.styling_options;
          dotsEnabled = stylingOptions?.dots_enabled !== false; // Default to true if not present
          waveGradientEnabled = stylingOptions?.wave_gradient_enabled === true; // Default to false if not present
          noiseTextureEnabled = stylingOptions?.noise_texture_enabled === true; // Default to false if not present
        } catch (e) {
          // If parsing fails, default to true for dots, false for others
          dotsEnabled = true;
          waveGradientEnabled = false;
          noiseTextureEnabled = false;
        }
      }
    }
  } catch (error) {
    // Silently fail and use default
    console.warn("Failed to load styling options:", error);
  }
  
  // Get home page from site_structure
  const homePageResult = await Promise.allSettled([
    getActivePageBySlug('home'),
  ]);
  const homePage = homePageResult[0].status === 'fulfilled' ? homePageResult[0].value : null;

  // Fetch sections if home page exists
  let sections: Section[] = [];
  let headerSection: Section | undefined = undefined;
  let footerSection: Section | undefined = undefined;
  
  if (homePage) {
    try {
      sections = await getVisibleSectionsByPageId(homePage.id);
      
      // Try to find header section from visible sections first
      headerSection = sections.find(section => section.type === 'header');
      
      // If not found, fetch header section separately (even if not visible)
      // But still apply status filtering to ensure consistency
      if (!headerSection) {
        const supabase = await createClient();
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Get all page_sections for this page
        const { data: allPageSections } = await supabase
          .from("page_sections")
          .select(`
            *,
            sections (*)
          `)
          .eq("page_id", homePage.id);
        
        // Filter page_sections based on status and environment (same as getVisibleSectionsByPageId)
        const filteredPageSections = (allPageSections || []).filter((ps: any) => {
          if (!ps.sections) return false; // Exclude if section is null
          return shouldIncludeItemByStatus(ps.status, isDevelopment);
        });
        
        // Find header section from filtered sections
        const headerPageSection = filteredPageSections.find(
          (ps: any) => ps.sections && ps.sections.type === "header"
        ) as any;
        
        if (headerPageSection?.sections) {
          const sectionId = headerPageSection.section_id;
          
          // Get CTA buttons for header section
          const { data: sectionCTAData } = await supabase
            .from("section_cta_buttons")
            .select(`
              *,
              cta_buttons (*)
            `)
            .eq("section_id", sectionId)
            .order("position", { ascending: true });
          
          // Get CTA button IDs from junction table
          const ctaButtonIds = sectionCTAData?.map((item: any) => item.cta_button_id).filter(Boolean) || [];
          
          // Query CTA buttons separately
          const { data: ctaButtonsData } = await supabase
            .from("cta_buttons")
            .select("*")
            .in("id", ctaButtonIds);
          
          // Create a map for quick lookup
          const ctaButtonsMap = new Map((ctaButtonsData || []).map((c: any) => [c.id, c]));
          
          // Transform CTA buttons with status filtering
          const ctaButtons: CTAButtonWithSection[] = (sectionCTAData || [])
            .filter((item: any) => {
              const ctaButton = ctaButtonsMap.get(item.cta_button_id);
              if (!ctaButton) return false;
              
              // Use helper function for consistent filtering
              return shouldIncludeItemByStatus(item.status, isDevelopment);
            })
            .map((item: any) => {
              const ctaButton = ctaButtonsMap.get(item.cta_button_id);
              if (!ctaButton) return null;
              
              return {
                ...ctaButton,
                section_cta_button: {
                  id: item.id,
                  position: item.position,
                  status: (item.status || "published") as "published" | "draft" | "deactivated",
                  created_at: item.created_at,
                },
              };
            })
            .filter((btn): btn is CTAButtonWithSection => btn !== null);
          
          headerSection = {
            ...(headerPageSection.sections as any),
            page_section_id: headerPageSection.id,
            position: headerPageSection.position,
            status: headerPageSection.status,
            ctaButtons: ctaButtons,
          };
        }
      }

      // Find footer section from visible sections
      footerSection = sections.find(section => section.type === 'footer');
    } catch (error) {
      console.error('Error fetching page sections:', error);
    }
  }

  // Component mapping based on section type
  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return <Hero key={section.id} section={section} ctaButtons={section.ctaButtons} />;
      
      case 'header':
        return <Header key={section.id} section={section} ctaButtons={section.ctaButtons} />;
      
      case 'logos':
        return <Logos key={section.id} section={section} softwares={section.softwares || []} />;
      
      case 'stories':
        return <Stories key={section.id} section={section} media={section.media as any || []} />;
      
      case 'features':
        return <Value key={section.id} section={section} offerFeatures={(section.features || []) as any} />;
      
      case 'offer':
        return <Offer key={section.id} section={section} offerFeatures={(section.features || []) as any} />;
      
      case 'testimonials':
        return (
          <Testimonials 
            key={section.id}
            testimonials={(section.testimonials || []) as any} 
            section={section} 
          />
        );
      
      case 'results':
        return <Results key={section.id} section={section} />;
      
      case 'performance':
        return <Performance key={section.id} section={section} />;
      
      case 'faq':
        return (
          <FAQ
            key={section.id}
            faqs={section.faqItems || []}
            section={section}
          />
        );
      
      case 'cta':
        return <CTA key={section.id} section={section} ctaButtons={section.ctaButtons} />;
      
      case 'timeline':
        return <Timeline key={section.id} section={section} {...({ timelineItems: section.timelineItems || [] } as any)} />;
      
      case 'footer':
        return (
          <Footer 
            key={section.id} 
            section={section} 
            socialPlatforms={(section.socialPlatforms || []) as any} 
          />
        );
      
      default:
        return null;
    }
  };

  // Generate structured data for SEO
  // Organization structured data
  const organizationSchema = generateOrganizationSchema({
    name: homePage?.title || SEO_CONFIG.siteName,
    description: homePage?.description || SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.siteUrl,
  });

  // Service schema for business type
  const serviceSchema = generateServiceSchema();

  // WebSite schema
  const websiteSchema = generateWebSiteSchema();

  // FAQ structured data - collect all FAQ items from all sections
  const allFAQItems = sections
    .flatMap(section => section.faqItems || [])
    .map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof faq.answer === 'string' ? faq.answer : JSON.stringify(faq.answer),
      },
    }));
  
  const faqSchema = allFAQItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQItems,
  } : null;

  // Testimonials structured data - collect all testimonials from all sections
  const allTestimonials = sections
    .flatMap(section => section.testimonials || []);
  
  const testimonialsSchema = allTestimonials.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": allTestimonials.map((testimonial: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": testimonial.author_name,
          ...(testimonial.author_role && { "jobTitle": testimonial.author_role }),
          ...(testimonial.company_name && { "worksFor": { "@type": "Organization", "name": testimonial.company_name } }),
        },
        "reviewBody": testimonial.quote,
        "headline": testimonial.headline,
        ...(testimonial.rating && { "reviewRating": { "@type": "Rating", "ratingValue": testimonial.rating, "bestRating": 5 } }),
      },
    })),
  } : null;

  return (
    <>
      {/* Structured Data for SEO - in head via Next.js */}
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
      {testimonialsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialsSchema) }}
        />
      )}
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden w-full">
        {/* Dot pattern at the top - fading at bottom */}
        {dotsEnabled && (
          <div className="absolute top-0 left-0 right-0 h-[1100px] pointer-events-none z-0">
            {/* Subtle dot pattern with fade at bottom */}
            <div className="absolute inset-0">
              {/* Dot pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--muted-foreground))_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 dark:opacity-15" />
              
              {/* Fade mask at bottom to blend into background */}
              <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
          </div>
        )}
        
        {/* Unified background effects at the bottom - overlapping CTA and Footer */}
        {dotsEnabled && (
          <div className="absolute bottom-0 left-0 right-0 h-[1350px] pointer-events-none z-0">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background" />
            
            
            {/* Subtle dot pattern with fade at top */}
            <div className="absolute inset-0">
              {/* Dot pattern - original size */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--muted-foreground))_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 dark:opacity-15" />
              
              {/* Fade mask at top to blend into background */}
              <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-background via-background/80 to-transparent" />
            </div>
          </div>
        )}

        {/* Wave Gradient Background - covers entire viewport continuously */}
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
          {homePage && (
          <ErrorBoundary>
            <AnalyticsTracker 
              pageId={homePage.id} 
              pageSlug="home" 
            />
          </ErrorBoundary>
        )}
        <ErrorBoundary>
          <Navbar sections={sections} headerSection={headerSection} />
        </ErrorBoundary>
        <main className="w-full relative">
          

          {/* Render sections dynamically in order from database */}
          {sections.length > 0 ? (
            sections
              .filter((section) => section.type !== 'header' && section.type !== 'footer')
              .map((section) => (
                <ErrorBoundary key={section.id}>
                  {renderSection(section)}
                </ErrorBoundary>
              ))
          ) : (
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Loading...</h1>
                <p className="text-muted-foreground">Please wait while we load the page content.</p>
              </div>
            </div>
          )}
        </main>
          <ErrorBoundary>
            <Footer 
              section={footerSection} 
              {...(footerSection ? { socialPlatforms: (footerSection.socialPlatforms || []) as any } : {})} 
            />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
