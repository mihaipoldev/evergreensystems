"use client";

import { motion } from 'framer-motion';
import { RichText } from '@/components/ui/RichText';
import { Search, Lightbulb, Rocket, TrendingUp, Award } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { resolveIconFromClass } from '@/lib/icon-utils';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type TimelineItem = {
  id: string;
  step: number;
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
    created_at: string;
  };
};

type TimelineProps = {
  section?: Section;
  timelineItems?: TimelineItem[];
};

type TimelineStep = {
  icon: typeof Search | IconDefinition | null;
  iconType: 'lucide' | 'fontawesome';
  title: string;
  description: string;
  goal: string;
  stepNumber: number;
};

const defaultTitleText = 'Your path to [[automation success]]';
const defaultSubtitle = 'How It Works';

// Map icon strings to Lucide icons
const lucideIconMap: Record<string, typeof Search> = {
  'search': Search,
  'lightbulb': Lightbulb,
  'rocket': Rocket,
  'trending-up': TrendingUp,
  'award': Award,
};

export const Timeline = ({ section, timelineItems = [] }: TimelineProps) => {
  // Use section data if available, otherwise use defaults
  const titleText = section?.title || defaultTitleText;
  const subtitle = section?.subtitle || defaultSubtitle;
  
  // Convert timeline items to steps
  let steps: TimelineStep[] = [];
  
  if (timelineItems.length > 0) {
    // Sort by section_timeline position
    const sortedItems = [...timelineItems].sort((a, b) => 
      a.section_timeline.position - b.section_timeline.position
    );
    
    steps = sortedItems.map((item) => {
      let icon: typeof Search | IconDefinition | null = null;
      let iconType: 'lucide' | 'fontawesome' = 'lucide';
      
      if (item.icon) {
        // Try to resolve as FontAwesome icon first
        const fontAwesomeIcon = resolveIconFromClass(item.icon);
        if (fontAwesomeIcon) {
          icon = fontAwesomeIcon;
          iconType = 'fontawesome';
        } else {
          // Try to map to Lucide icon
          const lucideIcon = lucideIconMap[item.icon.toLowerCase()];
          if (lucideIcon) {
            icon = lucideIcon;
            iconType = 'lucide';
          }
        }
      }
      
      // Fallback to Search icon if no icon found
      if (!icon) {
        icon = Search;
        iconType = 'lucide';
      }
      
      return {
        icon,
        iconType,
        title: item.title,
        description: item.subtitle || '',
        goal: item.badge || '',
        stepNumber: item.step || item.section_timeline.position + 1,
      };
    });
  }
  
  // If no timeline items, don't render the section
  if (steps.length === 0) {
    return null;
  }
  return (
    <section id="timeline" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {subtitle && (
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              {subtitle}
            </span>
          )}
          <RichText
            as="h2"
            text={titleText}
            className="text-2xl sm:text-5xl font-bold text-foreground mt-4 leading-tight"
          />
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary/50 via-primary to-primary/50" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative lg:flex lg:items-center lg:gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                  <div className={`bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors ${
                    index % 2 === 0 ? 'lg:ml-auto' : 'lg:mr-auto'
                  } max-w-md`}>
                    <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {step.iconType === 'fontawesome' && step.icon ? (
                          <FontAwesomeIcon icon={step.icon as IconDefinition} className="w-6 h-6 text-primary" />
                        ) : step.iconType === 'lucide' && step.icon ? (
                          (() => {
                            const IconComponent = step.icon as typeof Search;
                            return <IconComponent className="w-6 h-6 text-primary" />;
                          })()
                        ) : (
                          <Search className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <span className="text-primary text-xs font-medium uppercase tracking-wider">
                          Step {step.stepNumber}
                        </span>
                        <h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
                      </div>
                    </div>
                    {step.description && (
                      <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                    )}
                    {step.goal && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-primary text-xs font-medium">{step.goal}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Icon (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                {/* Spacer */}
                <div className="lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

