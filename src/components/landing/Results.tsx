"use client";

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Users, DollarSign, Clock, BarChart3 } from 'lucide-react';
import { RichText } from '@/components/ui/RichText';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type ResultsProps = {
  section?: Section;
};

const results = [
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

const metrics = [
  { icon: Clock, value: '80%', label: 'Time Saved' },
  { icon: BarChart3, value: '3.2x', label: 'ROI Average' },
  { icon: ArrowUp, value: '95%', label: 'Client Retention' },
];

export const Results = memo(({ section }: ResultsProps) => {
  // Use section data if available, otherwise use defaults
  const title = section?.title || 'Numbers that [[speak for themselves]]';

  return (
    <section id="results" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Proven Results
          </span>
          <RichText
            as="h2"
            text={title}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 leading-tight"
          />
        </motion.div>

        {/* Main Results Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {results.map((result, index) => (
            <motion.div
              key={result.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="relative group"
            >
              <div className="border-glow rounded-2xl bg-card p-8 h-full">
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
          {metrics.map((metric, index) => (
            <div key={metric.label} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
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

