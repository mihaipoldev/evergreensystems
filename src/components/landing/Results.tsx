"use client";

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Users, DollarSign, Clock, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RichText } from '@/components/ui/RichText';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
} | undefined;

type ResultsProps = {
  section?: Section;
};

type PrimaryResult = {
  id: string;
  label: string;
  value: string;
  icon: string;
  description: string;
};

type SecondaryMetric = {
  id: string;
  label: string;
  value: string;
  icon: string;
};

type TransformedPrimaryResult = {
  icon: LucideIcon;
  stat: string;
  label: string;
  description: string;
  gradient: string;
};

type TransformedSecondaryMetric = {
  icon: LucideIcon;
  value: string;
  label: string;
};

// Icon mapping from string to Lucide icon component
const iconMap: Record<string, LucideIcon> = {
  'users': Users,
  'user': Users,
  'dollar': DollarSign,
  'dollarsign': DollarSign,
  'clock': Clock,
  'chart': BarChart3,
  'barchart': BarChart3,
  'bar-chart': BarChart3,
  'arrow-up': ArrowUp,
  'arrowup': ArrowUp,
};

// Default gradients for primary results (can be extended)
const defaultGradients = [
  'from-primary to-blue-400',
  'from-cyan-500 to-primary',
];

export const Results = memo(({ section }: ResultsProps) => {
  // Parse content JSON
  const contentData = useMemo(() => {
    if (!section?.content) return null;
    
    try {
      const content = typeof section.content === 'string' 
        ? JSON.parse(section.content) 
        : section.content;
      
      return content;
    } catch (error) {
      console.warn('Failed to parse results content JSON:', error);
      return null;
    }
  }, [section?.content]);

  // Parse primary results
  const primaryResults = useMemo(() => {
    if (contentData?.primary && Array.isArray(contentData.primary)) {
      return contentData.primary.map((item: PrimaryResult, index: number) => {
        const iconName = item.icon?.toLowerCase() || '';
        const IconComponent = iconMap[iconName] || Users;
        const gradient = defaultGradients[index % defaultGradients.length];
        
        return {
          icon: IconComponent,
          stat: item.value,
          label: item.label,
          description: item.description || '',
          gradient,
        };
      });
    }
    
    // Fallback to defaults
    return [
      {
        icon: Users,
        stat: '500%',
        label: 'Increase in Qualified Leads',
        description: 'Average improvement in lead quality and volume after implementing our AI systems',
        gradient: 'from-primary to-blue-400',
      },
      {
        icon: DollarSign,
        stat: '$2.4M',
        label: 'Revenue Generated',
        description: 'Total revenue generated for clients in the last quarter through automation',
        gradient: 'from-cyan-500 to-primary',
      },
    ];
  }, [contentData]);

  // Parse secondary metrics
  const secondaryMetrics = useMemo(() => {
    if (contentData?.secondary && Array.isArray(contentData.secondary)) {
      return contentData.secondary.map((item: SecondaryMetric) => {
        const iconName = item.icon?.toLowerCase() || '';
        const IconComponent = iconMap[iconName] || Clock;
        
        return {
          icon: IconComponent,
          value: item.value,
          label: item.label,
        };
      });
    }
    
    // Fallback to defaults
    return [
      { icon: Clock, value: '80%', label: 'Time Saved' },
      { icon: BarChart3, value: '3.2x', label: 'ROI Average' },
      { icon: ArrowUp, value: '95%', label: 'Client Retention' },
    ];
  }, [contentData]);

  // Use section data if available, otherwise use defaults
  const title = section?.title || 'Numbers that [[speak for themselves]]';

  return (
    <section id="results" className="py-12 md:py-20 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center md:mb-16 mb-8"
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
        

        {/* Main Results Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {primaryResults.map((result: TransformedPrimaryResult, index: number) => (
            <motion.div
              key={result.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="md:rounded-2xl rounded-lg bg-card md:p-8 p-4 h-full">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${result.gradient} p-0.5 mb-6`}>
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <result.icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  
                  <div className="text-5xl sm:text-6xl font-bold text-gradient mb-2">
                    {result.stat}
                  </div>
                  <h3 className="text-foreground text-xl font-semibold mb-2">{result.label}</h3>
                  <p className="text-muted-foreground">{result.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 sm:gap-8"
        >
          {secondaryMetrics.map((metric: TransformedSecondaryMetric, index: number) => (
            <div key={metric.label} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-transparent flex items-center justify-center mx-auto mb-4">
                <metric.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{metric.value}</div>
              <p className="text-muted-foreground text-sm">{metric.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

Results.displayName = 'Results';

