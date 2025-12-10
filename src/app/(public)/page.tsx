import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero'; // Keep Hero static - it's above the fold
import { AnalyticsTracker } from '@/components/landing/AnalyticsTracker';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
import { getPageBySlug, getVisibleSectionsByPageId, getAllFAQItems, getApprovedTestimonials, getActiveOfferFeatures } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import type { CTAButtonWithSection } from '@/features/cta/types';
import type { FAQItem } from '@/features/faq/types';
import type { Testimonial } from '@/features/testimonials/types';
import type { Metadata } from 'next';

// Enable ISR - revalidate every 1 minute
export const revalidate = 60;

// Section type definition
type Section = {
  id: string;
  type: string;
  title: string | null;
  admin_title: string | null;
  subtitle: string | null;
  content: any | null;
  media_url: string | null;
  page_section_id: string;
  position: number;
  visible: boolean;
  ctaButtons?: CTAButtonWithSection[];
};

// Generate dynamic metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    const homePage = await getPageBySlug('home');
    
    if (!homePage) {
      return {
        title: 'Evergreen | AI Systems',
        description: 'Evergreen Systems - Building the future, one project at a time.',
        other: {
          'dns-prefetch': 'https://fast.wistia.com, https://img.youtube.com, https://i.vimeocdn.com',
        },
      };
    }

    // Always use "Evergreen | AI Systems" for the home page title
    const title = 'Evergreen | AI Systems';
    const description = homePage.description || 'Evergreen Systems - Building the future, one project at a time.';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evergreenlabs.com';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: siteUrl,
        siteName: 'Evergreen Systems',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: siteUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Evergreen | AI Systems',
      description: 'Evergreen Systems - Building the future, one project at a time.',
    };
  }
}

export default async function LandingPage() {
  // Parallelize all database queries for better performance
  const [homePageResult, faqItemsResult, testimonialsResult, offerFeaturesResult] = await Promise.allSettled([
    getPageBySlug('home'),
    getAllFAQItems(),
    getApprovedTestimonials(),
    getActiveOfferFeatures(),
  ]);

  // Extract results with error handling
  const homePage = homePageResult.status === 'fulfilled' ? homePageResult.value : null;
  const faqItems: FAQItem[] = faqItemsResult.status === 'fulfilled' ? (faqItemsResult.value as FAQItem[]) : [];
  const testimonials: Testimonial[] = testimonialsResult.status === 'fulfilled' ? (testimonialsResult.value as Testimonial[]) : [];
  const offerFeatures = offerFeaturesResult.status === 'fulfilled' ? offerFeaturesResult.value : [];

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
      if (!headerSection) {
        const supabase = await createClient();
        
        // Get all page_sections for this page
        const { data: allPageSections } = await supabase
          .from("page_sections")
          .select(`
            *,
            sections (*)
          `)
          .eq("page_id", homePage.id);
        
        // Find header section
        const headerPageSection = allPageSections?.find(
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
          
          // Transform CTA buttons
          const ctaButtons: CTAButtonWithSection[] = (sectionCTAData || [])
            .filter((item: any) => item.cta_buttons && item.cta_buttons.status === "active")
            .map((item: any) => ({
              ...item.cta_buttons,
              status: item.cta_buttons.status as "active" | "deactivated",
              section_cta_button: {
                id: item.id,
                position: item.position,
                created_at: item.created_at,
              },
            }));
          
          headerSection = {
            ...(headerPageSection.sections as any),
            page_section_id: headerPageSection.id,
            position: headerPageSection.position,
            visible: headerPageSection.visible,
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
        return <Logos key={section.id} section={section} />;
      
      case 'stories':
        return <Stories key={section.id} section={section} />;
      
      case 'features':
        return <Value key={section.id} section={section} offerFeatures={offerFeatures} />;
      
      case 'testimonials':
        return (
          <Testimonials 
            key={section.id}
            testimonials={testimonials} 
            section={section} 
          />
        );
      
      case 'results':
        return <Results key={section.id} section={section} />;
      
      case 'faq':
        return (
          <FAQ 
            key={section.id}
            faqs={faqItems} 
            section={section} 
          />
        );
      
      case 'cta':
        return <CTA key={section.id} section={section} ctaButtons={section.ctaButtons} />;
      
      case 'footer':
        return <Footer key={section.id} section={section} />;
      
      default:
        return null;
    }
  };

  // Generate structured data for SEO
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evergreenlabs.com';
  
  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": homePage?.title || "Evergreen Systems",
    "description": homePage?.description || "Evergreen Systems - Building the future, one project at a time.",
    "url": siteUrl,
  };

  // FAQ structured data
  const faqSchema = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof faq.answer === 'string' ? faq.answer : JSON.stringify(faq.answer),
      },
    })),
  } : null;

  // Testimonials structured data
  const testimonialsSchema = testimonials.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": testimonials.map((testimonial, index) => ({
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
        {/* Square grid pattern at the top - fading at bottom */}
        <div className="absolute top-0 left-0 right-0 h-[1000px] pointer-events-none z-0">
          {/* Subtle grid pattern with fade at bottom */}
          <div className="absolute inset-0">
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
            
            {/* Fade mask at bottom to blend into background */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
        </div>
        
        {/* Unified background effects at the bottom - overlapping CTA and Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-[1400px] pointer-events-none z-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background" />
          
          {/* Glow effects */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
          </div>
          
          {/* Subtle grid pattern with fade at top */}
          <div className="absolute inset-0">
            {/* Grid pattern - original size */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
            
            {/* Fade mask at top to blend into background */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-background via-background/80 to-transparent" />
          </div>
        </div>
        
        <div className="relative z-10">
          {homePage && (
          <ErrorBoundary>
            <AnalyticsTracker 
              pageId={homePage.id} 
              pageSlug={homePage.slug} 
            />
          </ErrorBoundary>
        )}
        <ErrorBoundary>
          <Navbar sections={sections} headerSection={headerSection} />
        </ErrorBoundary>
        <main className="w-full">
          {/* Render sections dynamically in order from database */}
          {sections.length > 0 ? (
            sections
              .filter((section) => section.type !== 'header' && section.type !== 'footer') // Exclude header/footer from main render
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
            <Footer section={footerSection} />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
