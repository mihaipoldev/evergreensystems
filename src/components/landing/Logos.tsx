"use client";

import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import { RichText } from '@/components/ui/RichText';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type LogosProps = {
  section?: Section;
};

const logos = [
  { name: 'n8n', initials: 'N8N' },
  { name: 'Instantly', initials: 'IN' },
  { name: 'Apify', initials: 'AP' },
  { name: 'OpenAI', initials: 'OA' },
  { name: 'Apollo', initials: 'AL' },
  { name: 'StoreLeads', initials: 'SL' },
  { name: 'Clutch', initials: 'CL' },
  { name: 'G2', initials: 'G2' },
  { name: 'Crunchbase', initials: 'CB' },
  { name: 'ColdSire', initials: 'CS' },
  { name: 'NeverBounce', initials: 'NB' },
  { name: 'BuiltWith', initials: 'BW' },
  { name: 'Outscraper', initials: 'OS' },
  { name: 'Supabase', initials: 'SB' },
  { name: 'Vercel', initials: 'VC' },
];

export const Logos = ({ section }: LogosProps) => {
  // Use section title if available, otherwise use default
  const title = section?.title || 'Built with industry-leading data & automation tools';

  return (
    <section className="py-16 pt-24 relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <RichText
            as="p"
            text={title}
            className="text-center text-sm text-muted-foreground mb-10 tracking-wider"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <Marquee
            speed={30}
            gradient={true}
            gradientColor="hsl(var(--background))"
            gradientWidth={100}
            pauseOnHover={false}
            className="overflow-hidden"
            direction="left"
          >
            {logos.map((logo) => (
              <div
                key={`row1-${logo.name}`}
                className="flex items-center gap-2 opacity-40 mx-10"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 hidden">
                  <span className="text-muted-foreground font-semibold text-sm">{logo.initials}</span>
                </div>
                <span className="text-foreground font-medium text-lg whitespace-nowrap">{logo.name}</span>
              </div>
            ))}
          </Marquee>
          <Marquee
            speed={30}
            gradient={true}
            gradientColor="hsl(var(--background))"
            gradientWidth={100}
            pauseOnHover={false}
            className="overflow-hidden"
            direction="right"
          >
            {logos.map((logo) => (
              <div
                key={`row2-${logo.name}`}
                className="flex items-center gap-2 opacity-40 mx-10"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 hidden">
                  <span className="text-muted-foreground font-semibold text-sm">{logo.initials}</span>
                </div>
                <span className="text-foreground font-medium text-lg whitespace-nowrap">{logo.name}</span>
              </div>
            ))}
          </Marquee>
        </motion.div>
      </div>
    </section>
  );
};

