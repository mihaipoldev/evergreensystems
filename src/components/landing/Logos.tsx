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

type Software = {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  icon: string | null;
  section_software: {
    id: string;
    order: number;
    icon_override: string | null;
    status?: "published" | "draft" | "deactivated";
  };
};

type LogosProps = {
  section?: Section;
  softwares?: Software[];
};

export const Logos = ({ section, softwares = [] }: LogosProps) => {
  // Use section title if available, otherwise use default
  const title = section?.title || 'Built with industry-leading data & automation tools';

  // If no softwares, don't render the section
  if (!softwares || softwares.length === 0) {
    return null;
  }

  // Use softwares from database, sorted by order
  const sortedSoftwares = [...softwares].sort((a, b) => a.section_software.order - b.section_software.order);

  return (
    <section id="logos" className="py-16 relative">
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

        <div className="space-y-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            <Marquee
              speed={30}
              gradient={false}
              pauseOnHover={false}
              className="overflow-visible"
              direction="left"
            >
            {sortedSoftwares.map((software) => {
              const displayIcon = software.section_software.icon_override || software.icon;
              return (
                <div
                  key={`row1-${software.id}`}
                  className="flex items-center gap-2 opacity-40 mx-10"
                >
                  {displayIcon ? (
                    <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0 overflow-hidden border border-muted-foreground/10">
                      <img
                        src={displayIcon}
                        alt={software.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          // Hide image on error, show name only
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0 hidden border border-muted-foreground/10">
                      <span className="text-muted-foreground font-semibold text-sm">
                        {software.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-foreground font-medium text-lg whitespace-nowrap">{software.name}</span>
                </div>
              );
            })}
            </Marquee>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            <Marquee
              speed={30}
              gradient={false}
              pauseOnHover={false}
              className="overflow-visible"
              direction="right"
            >
            {sortedSoftwares.map((software) => {
              const displayIcon = software.section_software.icon_override || software.icon;
              return (
                <div
                  key={`row2-${software.id}`}
                  className="flex items-center gap-2 opacity-40 mx-10"
                >
                  {displayIcon ? (
                    <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0 overflow-hidden border border-muted-foreground/10">
                      <img
                        src={displayIcon}
                        alt={software.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          // Hide image on error, show name only
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0 hidden border border-muted-foreground/10">
                      <span className="text-muted-foreground font-semibold text-sm">
                        {software.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-foreground font-medium text-lg whitespace-nowrap">{software.name}</span>
                </div>
              );
            })}
            </Marquee>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

