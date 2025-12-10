"use client";

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faRobot,
  faShield,
  faShieldAlt,
  faShieldHalved,
  faBrain,
  faCogs,
  faChartLine,
  faComments,
  faHandshake,
  faGaugeHigh,
  faSliders,
  faWandMagicSparkles,
  faCheckCircle,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { RichText } from '@/components/ui/RichText';
import type { Database } from '@/lib/supabase/types';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type OfferFeature = Database["public"]["Tables"]["offer_features"]["Row"];

type ValueProps = {
  section?: Section;
  offerFeatures?: OfferFeature[];
};

// Map icon names (strings) to FontAwesome icons
// Handles both "fa-robot" and "robot" formats
const iconMap: Record<string, IconDefinition> = {
  'fa-bullseye': faBullseye,
  'bullseye': faBullseye,
  'fa-target': faBullseye,
  'target': faBullseye,
  'fa-robot': faRobot,
  'robot': faRobot,
  'fa-shield': faShield,
  'fa-shield-alt': faShieldAlt,
  'fa-shield-halved': faShieldHalved,
  'fa-shield-check': faShieldAlt, // Using faShieldAlt as alternative until faShieldCheck is available
  'fa-shield-virus': faShieldAlt,
  'shield': faShield,
  'shield-alt': faShieldAlt,
  'shield-halved': faShieldHalved,
  'shield-check': faShieldAlt, // Using faShieldAlt as alternative until faShieldCheck is available
  'shield-virus': faShieldAlt,
  'fa-brain': faBrain,
  'brain': faBrain,
  'fa-cogs': faCogs,
  'fa-gears': faCogs,
  'cogs': faCogs,
  'gears': faCogs,
  'fa-chart-line': faChartLine,
  'fa-chart': faChartLine,
  'fa-line-chart': faChartLine,
  'chart-line': faChartLine,
  'chart': faChartLine,
  'line-chart': faChartLine,
  'fa-badge-check': faCheckCircle, // Pro icon - using faCheckCircle as free alternative
  'badge-check': faCheckCircle, // Pro icon - using faCheckCircle as free alternative
  'badge': faCheckCircle, // Pro icon - using faCheckCircle as free alternative
  'fa-comments': faComments,
  'comments': faComments,
  'fa-handshake': faHandshake,
  'handshake': faHandshake,
  'fa-gauge-high': faGaugeHigh,
  'gauge-high': faGaugeHigh,
  'gauge': faGaugeHigh,
  'fa-sliders': faSliders,
  'sliders': faSliders,
  'fa-wand-magic-sparkles': faWandMagicSparkles,
  'wand-magic-sparkles': faWandMagicSparkles,
  'wand-magic': faWandMagicSparkles,
  'wand': faWandMagicSparkles,
  'magic': faWandMagicSparkles,
};

// Default fallback features if database is empty
const defaultFeatures = [
  {
    icon: faBullseye,
    title: 'Accurate targeting',
    description: 'Powered by real industry signals',
  },
  {
    icon: faRobot,
    title: 'Automated lead sourcing',
    description: 'And enrichment',
  },
  {
    icon: faShieldAlt,
    title: 'Clean, validated data',
    description: 'With deliverability in mind',
  },
  {
    icon: faBrain,
    title: 'AI-assisted personalization',
    description: 'That feels human',
  },
  {
    icon: faCogs,
    title: 'Fully automated workflows',
    description: 'That run on their own',
  },
  {
    icon: faChartLine,
    title: 'Predictable sales conversations',
    description: 'Every week',
  },
];

export const Value = ({ section, offerFeatures = [] }: ValueProps) => {
  // Use section data if available, otherwise use defaults
  const title = section?.title || 'A reliable outbound system — built with [[automation]], clean data, and real personalization.';
  const subtitle = section?.subtitle || 'We build and maintain the automation layer behind your outbound: accurate targeting, automated lead acquisition, clean data pipelines, and consistent results.';

  // Map database features to display format, or use defaults
  const features = offerFeatures.length > 0
    ? offerFeatures.map((feature) => {
        // Get icon from iconMap, try both with and without "fa-" prefix
        const iconName = feature.icon?.toLowerCase() || '';
        
        // Try exact match first
        let icon = iconMap[iconName];
        
        // If not found, try with/without "fa-" prefix
        if (!icon) {
          if (iconName.startsWith('fa-')) {
            icon = iconMap[iconName.substring(3)]; // Try without "fa-" prefix
          } else {
            icon = iconMap[`fa-${iconName}`]; // Try with "fa-" prefix
          }
        }
        
        // Special fallback for shield variations
        if (!icon && iconName.includes('shield')) {
          icon = faShieldAlt; // Default to shield-alt for any shield variant
        }
        
        // Final fallback
        if (!icon) {
          icon = defaultFeatures[0].icon;
        }
        
        return {
          icon,
          title: feature.title,
          description: feature.description || feature.subtitle || '',
        };
      })
    : defaultFeatures;

  return (
    <section id="services" className="py-20 relative">
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
            <RichText
              as="h2"
              text={title}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 leading-tight"
            />
          </motion.div>
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
              <div className="relative h-full border-glow rounded-2xl bg-card p-6 overflow-hidden">
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

