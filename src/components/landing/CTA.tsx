"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RichText } from '@/components/ui/RichText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { CTAButtonWithSection } from '@/features/page-builder/cta/types';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
  ctaButtons?: CTAButtonWithSection[];
} | undefined;

type CTAProps = {
  section?: Section;
  ctaButtons?: CTAButtonWithSection[];
};

export const CTA = ({ section, ctaButtons }: CTAProps) => {
  // Use section data if available, otherwise use defaults
  const title = section?.title || "Let's build your [[automation engine]]";
  const subtitle = section?.subtitle?.trim() || "Book a free 30-minute strategy session with our team. We'll analyze your current workflow and show you exactly how automation can transform your business.";
  
  // Get CTA buttons from props or section
  const buttons = ctaButtons || section?.ctaButtons || [];
  
  // Sort buttons by position
  const sortedButtons = [...buttons].sort((a, b) => 
    a.section_cta_button.position - b.section_cta_button.position
  );

  // Handle CTA button click tracking
  const handleCTAClick = (button: CTAButtonWithSection) => {
    trackEvent({
      event_type: "link_click",
      entity_type: "cta_button",
      entity_id: button.id,
      metadata: {
        location: "cta_section",
        href: button.url,
        label: button.label,
      },
    });
  };

  return (
    <section id="cta" className="py-12 md:py-20 pb-20 md:pb-32 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Decorative accent line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "4rem" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1 bg-primary mx-auto mb-8 rounded-full"
          />
          
          {section?.eyebrow && (
            <span className="text-primary text-sm font-medium uppercase tracking-wider block mb-4">
              {section.eyebrow}
            </span>
          )}
          
          <RichText
            as="h2"
            text={title}
            className="text-2xl md:text-5xl font-bold text-foreground mb-6 leading-tight"
          />
          <RichText
            as="p"
            text={subtitle}
            className="text-muted-foreground text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
          />

          {/* CTA Buttons with enhanced styling */}
          {sortedButtons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center items-center max-w-3xl mx-auto"
            >
              {sortedButtons.map((button, index) => (
                <div key={button.id} className="relative flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      opacity: { duration: 0.6, delay: 0.3 + index * 0.1 },
                      y: { duration: 0.6, delay: 0.3 + index * 0.1 },
                      scale: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      asChild
                      className={cn(
                        "relative h-14 px-8 font-semibold whitespace-nowrap text-base transition-all duration-150",
                        "border-2",
                        button.style === "primary" || !button.style
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20 hover:border-primary/40"
                          : button.style === "secondary"
                          ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-secondary/20 hover:border-secondary/40"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground border-primary/20 hover:border-primary/40"
                      )}
                    >
                      <Link 
                        href={button.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => handleCTAClick(button)}
                        className="flex items-center justify-center gap-2"
                      >
                        {button.icon && (
                          <FontAwesomeIcon
                            icon={button.icon as any}
                            className="h-4 w-4"
                          />
                        )}
                        {button.label}
                      </Link>
                    </Button>
                  </motion.div>
                  {button.subtitle && (
                    <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
                      {button.subtitle}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          )}
          
          {/* Subtle decorative element at bottom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 flex justify-center"
          >
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

