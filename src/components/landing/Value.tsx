"use client";

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import { RichText } from '@/components/ui/RichText';
import type { Database } from '@/lib/supabase/types';
import { resolveIconFromClass } from '@/lib/icon-utils';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
} | undefined;

type OfferFeatureBase = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

type OfferFeatureWithSection = OfferFeatureBase & {
  section_feature?: {
    id: string;
    position: number;
    status: "published" | "draft" | "deactivated";
    created_at: string;
  };
};

type ValueProps = {
  section?: Section;
  offerFeatures?: OfferFeatureWithSection[];
};


export const Value = ({ section, offerFeatures = [] }: ValueProps) => {
  // If no features, don't render the section
  if (!offerFeatures || offerFeatures.length === 0) {
    return null;
  }

  // Use section data if available
  const title = section?.title || 'A reliable outbound system — built with [[automation]], clean data, and real personalization.';
  const subtitle = section?.subtitle || null;

  // Map database features to display format
  const features = offerFeatures.map((feature) => {
    // Resolve icon dynamically using the utility function
    // This will handle all Font Awesome icons, not just a hardcoded list
    let icon = resolveIconFromClass(feature.icon);
    
    // Fallback to a default icon if not found
    if (!icon) {
      icon = faBullseye;
    }
    
    return {
      icon,
      title: feature.title,
      description: feature.description || feature.subtitle || '',
    };
  });

  return (
    <section id="services" className="py-12 md:py-20 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {section?.eyebrow && (
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                {section.eyebrow}
              </span>
            )}
            <RichText
              as="h2"
              text={title}
              className="text-2xl md:text-5xl font-bold text-foreground mt-4 leading-tight"
            />
          </motion.div>
          {subtitle && subtitle.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <RichText
              as="p"
              text={subtitle}
              className="text-muted-foreground text-lg mt-6 leading-relaxed max-w-[800px] mx-auto"
            />
          </motion.div>
          )}
        </motion.div>

        {/* Value Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative"
            >
              <div className="relative h-full rounded-2xl border border-border bg-gradient-to-br from-card/50 via-card/55 to-card/50 hover:border-primary/20 hover:from-card/60 hover:via-card/65 hover:to-card/60 transition-all duration-300 p-6 overflow-hidden">
                <div className="relative z-10">
                  {/* Icon Container */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.4 }}
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                  >
                    <FontAwesomeIcon
                      icon={feature.icon}
                      className="w-7 h-7 text-primary"
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-foreground text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <RichText
                    as="p"
                    text={feature.description}
                    className="text-muted-foreground text-sm leading-relaxed"
                  />

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5">
                    <FontAwesomeIcon
                      icon={feature.icon}
                      className="w-full h-full text-primary"
                    />
                  </div>
                </div>
              </div>
              </motion.div>
            ))}
          </div>
      </div>
    </section>
  );
};

