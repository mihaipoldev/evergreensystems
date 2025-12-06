import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Logos } from '@/components/landing/Logos';
import { Stories } from '@/components/landing/Stories';
import { Value } from '@/components/landing/Value';
import { Testimonials } from '@/components/landing/Testimonials';
import { Results } from '@/components/landing/Results';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { AnalyticsTracker } from '@/components/landing/AnalyticsTracker';
import { MobileScrollLock } from '@/components/landing/MobileScrollLock';
import { getPageBySlug, getVisibleSectionsByPageId, getAllFAQItems, getApprovedTestimonials } from '@/lib/supabase/queries';
import { getAllOfferFeatures } from '@/features/features/data';
import type { Database } from '@/lib/supabase/types';
import type { Section } from '@/features/sections/types';

// Extended section type with page_section metadata
type SectionWithPageMetadata = Section & {
  page_section_id: string;
  position: number;
  visible: boolean;
};

export default async function LandingPage() {
  // Fetch the home page (/ corresponds to "home" slug)
  let sections: SectionWithPageMetadata[] = [];
  let homePage: Database["public"]["Tables"]["pages"]["Row"] | null = null;
  
  try {
    homePage = await getPageBySlug('home');
    if (homePage) {
      sections = await getVisibleSectionsByPageId(homePage.id);
    }
  } catch (error) {
    console.error('Error fetching page sections:', error);
  }

  // Fetch data for specific sections
  let faqItems: Database["public"]["Tables"]["faq_items"]["Row"][] = [];
  let testimonials: Database["public"]["Tables"]["testimonials"]["Row"][] = [];
  let offerFeatures: Database["public"]["Tables"]["offer_features"]["Row"][] = [];
  
  try {
    faqItems = await getAllFAQItems();
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
  }

  try {
    testimonials = await getApprovedTestimonials();
  } catch (error) {
    console.error('Error fetching testimonials:', error);
  }

  try {
    offerFeatures = await getAllOfferFeatures();
  } catch (error) {
    console.error('Error fetching offer features:', error);
  }

  // Component mapping based on section type
  const renderSection = (section: SectionWithPageMetadata) => {
    switch (section.type) {
      case 'hero':
        return <Hero key={section.id} section={section} ctaButtons={section.ctaButtons} />;
      
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
      
      default:
        return null;
    }
  };

  return (
    <>
      <MobileScrollLock />
      <div className="bg-background text-foreground w-full">
        {homePage && (
          <AnalyticsTracker 
            pageId={homePage.id} 
            pageSlug={homePage.slug} 
          />
        )}
        <Navbar sections={sections} />
        <main className="w-full">
          {/* Render sections dynamically in order from database */}
          {sections.map((section) => renderSection(section))}
        </main>
        <Footer />
      </div>
    </>
  );
}
