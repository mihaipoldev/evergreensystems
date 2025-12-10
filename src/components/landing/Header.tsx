"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RichText } from '@/components/ui/RichText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { CTAButtonWithSection } from '@/features/cta/types';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
  ctaButtons?: CTAButtonWithSection[];
} | undefined;

type HeaderProps = {
  section?: Section;
  ctaButtons?: CTAButtonWithSection[];
};

// Helper function to handle smooth scroll for anchor links
const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  // Check if it's an anchor link (starts with #)
  if (href.startsWith('#')) {
    e.preventDefault();
    
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const navbarHeight = 80; // Height of the navbar
      const offset = 20; // Additional offset for better spacing
      const targetPosition = targetElement.offsetTop - navbarHeight - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  }
};

export const Header = ({ section, ctaButtons }: HeaderProps) => {
  // Use section data if available, otherwise use defaults
  const title = section?.title || "Welcome";
  const subtitle = section?.subtitle?.trim() || "";
  
  // Get CTA buttons from props or section
  const buttons = ctaButtons || section?.ctaButtons || [];
  
  // Sort buttons by position
  const sortedButtons = [...buttons].sort((a, b) => 
    a.section_cta_button.position - b.section_cta_button.position
  );

  // Handle CTA button click tracking
  const handleHeaderCTAClick = (button: CTAButtonWithSection) => {
    trackEvent({
      event_type: "link_click",
      entity_type: "cta_button",
      entity_id: button.id,
      metadata: {
        location: "header_section",
        href: button.url,
        label: button.label,
      },
    });
  };

  return (
    <section id={section?.id ? `header-${section.id}` : "header"} className="py-16 md:py-24 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {title && (
            <RichText
              as="h2"
              text={title}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            />
          )}
          
          {subtitle && (
            <RichText
              as="p"
              text={subtitle}
              className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto"
            />
          )}

          {/* Header Buttons */}
          {sortedButtons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center items-center max-w-2xl mx-auto"
            >
              {sortedButtons.map((button, index) => {
                const isAnchorLink = button.url.startsWith('#');
                
                return (
                  <motion.div
                    key={button.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      asChild
                      className={cn(
                        "h-12 px-6 font-semibold whitespace-nowrap",
                        button.style === "primary" || !button.style
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : button.style === "secondary"
                          ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      )}
                    >
                      <Link 
                        href={button.url}
                        {...(isAnchorLink ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                        onClick={(e) => {
                          if (isAnchorLink) {
                            handleSmoothScroll(e, button.url);
                          }
                          handleHeaderCTAClick(button);
                        }}
                      >
                        {button.icon && (
                          <FontAwesomeIcon
                            icon={button.icon as any}
                            className="h-4 w-4 mr-2"
                          />
                        )}
                        {button.label}
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
