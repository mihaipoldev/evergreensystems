"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RichText } from '@/components/ui/RichText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { usePublicTeam } from '@/providers/PublicTeamProvider';
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

type CTAProps = {
  section?: Section;
  ctaButtons?: CTAButtonWithSection[];
};

export const CTA = ({ section, ctaButtons }: CTAProps) => {
  const { teamMembers, totalTeamCount, displayCount } = usePublicTeam();
  const remainingCount = totalTeamCount - displayCount;
  
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
    <section id="cta" className="py-24 relative">
      {/* Background Effects */}
      <div 
        className="absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-60"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 3%, rgba(0,0,0,0.15) 8%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,1) 70%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 3%, rgba(0,0,0,0.15) 8%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,1) 70%, rgba(0,0,0,1) 100%)',
        }}
      />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Team Avatars */}
          <div className="flex justify-center -space-x-3 mb-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`w-12 h-12 rounded-full ${member.color} border-4 border-background flex items-center justify-center text-white font-semibold text-sm`}
                title={member.name}
              >
                {member.initial || member.name[0]}
              </motion.div>
            ))}
            {remainingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: displayCount * 0.1 }}
                className="w-12 h-12 rounded-full bg-secondary border-4 border-background flex items-center justify-center text-muted-foreground font-semibold text-xs"
                title={`${remainingCount} more team members`}
              >
                +{remainingCount}
              </motion.div>
            )}
          </div>

          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Ready to Transform?
          </span>
          <RichText
            as="h2"
            text={title}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6"
          />
          <RichText
            as="p"
            text={subtitle}
            className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto"
          />

          {/* CTA Buttons */}
          {sortedButtons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center items-center max-w-2xl mx-auto"
            >
              {sortedButtons.map((button, index) => (
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
                      "h-14 px-8 font-semibold whitespace-nowrap text-base",
                      button.style === "primary" || !button.style
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : button.style === "secondary"
                        ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <Link 
                      href={button.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => handleCTAClick(button)}
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
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

