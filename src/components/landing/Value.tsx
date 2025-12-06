"use client";

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faRobot,
  faShieldAlt,
  faBrain,
  faCogs,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { RichText } from '@/components/ui/RichText';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type ValueProps = {
  section?: Section;
};

const valuePoints = [
  {
    icon: faBullseye,
    title: 'Accurate targeting',
    description: 'Powered by real industry signals',
    gradient: 'from-primary/20 to-blue-500/10',
  },
  {
    icon: faRobot,
    title: 'Automated lead sourcing',
    description: 'And enrichment',
    gradient: 'from-cyan-500/20 to-primary/10',
  },
  {
    icon: faShieldAlt,
    title: 'Clean, validated data',
    description: 'With deliverability in mind',
    gradient: 'from-green-500/20 to-emerald-500/10',
  },
  {
    icon: faBrain,
    title: 'AI-assisted personalization',
    description: 'That feels human',
    gradient: 'from-purple-500/20 to-pink-500/10',
  },
  {
    icon: faCogs,
    title: 'Fully automated workflows',
    description: 'That run on their own',
    gradient: 'from-orange-500/20 to-red-500/10',
  },
  {
    icon: faChartLine,
    title: 'Predictable sales conversations',
    description: 'Every week',
    gradient: 'from-primary/20 to-indigo-500/10',
  },
];

export const Value = ({ section }: ValueProps) => {
  // Use section data if available, otherwise use defaults
  const title = section?.title || 'A reliable outbound system — built with [[automation]], clean data, and real personalization.';
  const subtitle = section?.subtitle || 'We build and maintain the automation layer behind your outbound: accurate targeting, automated lead acquisition, clean data pipelines, and consistent results.';

  return (
    <section id="services" className="py-32 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-primary text-sm font-medium uppercase tracking-wider mb-4"
          >
            Why EvergreenLabs
          </motion.span>
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
            {valuePoints.map((point, index) => (
              <motion.div
              key={point.title}
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
                      icon={point.icon}
                      className="w-7 h-7 text-primary"
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-foreground text-xl font-semibold mb-2">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {point.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5">
                    <FontAwesomeIcon
                      icon={point.icon}
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

