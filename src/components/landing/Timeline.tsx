"use client";

import { motion } from 'framer-motion';
import { RichText } from '@/components/ui/RichText';
import { Search, Lightbulb, Rocket, TrendingUp, Award } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discovery Call',
    description: 'We dive deep into your business to understand pain points, goals, and opportunities.',
    goal: 'Map your automation potential',
  },
  {
    icon: Lightbulb,
    title: 'Strategy Design',
    description: 'Our team crafts a custom automation blueprint tailored to your specific needs.',
    goal: 'Blueprint for transformation',
  },
  {
    icon: Rocket,
    title: 'Build & Deploy',
    description: 'We build and implement your AI systems with precision and speed.',
    goal: 'Launch in 2-4 weeks',
  },
  {
    icon: TrendingUp,
    title: 'Optimize & Scale',
    description: 'Continuous monitoring and optimization to maximize your ROI.',
    goal: '10x efficiency gains',
  },
  {
    icon: Award,
    title: 'Ongoing Support',
    description: 'Dedicated support and regular updates to keep your systems running perfectly.',
    goal: 'Long-term partnership',
  },
];

const titleText = 'Your path to [[automation success]]';

export const Timeline = () => {
  return (
    <section id="about" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            How It Works
          </span>
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
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <span className="text-primary text-xs font-medium uppercase tracking-wider">
                          Step {index + 1}
                        </span>
                        <h3 className="text-foreground text-lg font-semibold">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{step.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-primary text-xs font-medium">{step.goal}</span>
                    </div>
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

