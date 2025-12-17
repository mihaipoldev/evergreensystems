"use client";

import { motion } from 'framer-motion';
import { RichText } from '@/components/ui/RichText';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
} | undefined;

type PerformanceProps = {
  section?: Section;
};

type Metric = {
  value: string;
  label: string;
  description: string;
};

export const Performance = ({ section }: PerformanceProps) => {
  // Parse metrics from section content
  let metrics: Metric[] = [];
  
  if (section?.content) {
    try {
      const content = typeof section.content === 'string' 
        ? JSON.parse(section.content) 
        : section.content;
      
      if (content?.metrics && Array.isArray(content.metrics)) {
        metrics = content.metrics;
      }
    } catch (error) {
      console.warn('Failed to parse performance content JSON:', error);
    }
  }

  // Default metrics if none provided
  if (metrics.length === 0) {
    metrics = [
      {
        value: "18%",
        label: "Reply Rate",
        description: "(Industry avg: 1-3%)"
      },
      {
        value: "9%",
        label: "Positive Reply Rate",
        description: "High intent responses"
      },
      {
        value: "1:100",
        label: "Conversion Ratio",
        description: "Qualified conversations"
      }
    ];
  }

  const eyebrow = section?.eyebrow || "PERFORMANCE METRICS THAT MATTER";

  return (
    <section id="performance" className="py-12 md:py-20 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {eyebrow && (
            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
              {eyebrow}
            </span>
          )}
        </motion.div>

        {/* Horizontal divider above metrics */}
        <div className="border-t border-border/50 mb-12"></div>

        {/* Metrics Grid - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              {/* Value - Large blue text */}
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">
                {metric.value}
              </div>
              
              {/* Label */}
              <div className="text-foreground text-base md:text-lg font-medium mb-2">
                {metric.label}
              </div>
              
              {/* Description */}
              <div className="text-muted-foreground text-sm">
                {metric.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Horizontal divider below metrics */}
        <div className="border-t border-border/50 mt-12"></div>
      </div>
    </section>
  );
};
