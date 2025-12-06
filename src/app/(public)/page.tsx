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
import { getPageBySlug, getVisibleSectionsByPageId, getAllFAQItems, getApprovedTestimonials } from '@/lib/supabase/queries';
import type { Database } from '@/lib/supabase/types';

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
};

export default async function LandingPage() {
  // Fetch the home page (/ corresponds to "home" slug)
  let sections: Section[] = [];
  
  try {
    const homePage = await getPageBySlug('home');
    if (homePage) {
      sections = await getVisibleSectionsByPageId(homePage.id);
    }
  } catch (error) {
    console.error('Error fetching page sections:', error);
  }

  // Fetch data for specific sections
  let faqItems: Database["public"]["Tables"]["faq_items"]["Row"][] = [];
  let testimonials: Database["public"]["Tables"]["testimonials"]["Row"][] = [];
  
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

  // Component mapping based on section type
  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return <Hero key={section.id} section={section} />;
      
      case 'logos':
        return <Logos key={section.id} section={section} />;
      
      case 'stories':
        return <Stories key={section.id} section={section} />;
      
      case 'features':
        return <Value key={section.id} section={section} />;
      
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
        return <CTA key={section.id} section={section} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        {/* Render sections dynamically in order from database */}
        {sections.map((section) => renderSection(section))}
      </main>
      <Footer />
    </div>
  );
}
