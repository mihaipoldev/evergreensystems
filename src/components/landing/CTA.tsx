"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichText } from '@/components/ui/RichText';
import { usePublicTeam } from '@/providers/PublicTeamProvider';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type CTAProps = {
  section?: Section;
};

export const CTA = ({ section }: CTAProps) => {
  const { teamMembers, totalTeamCount, displayCount } = usePublicTeam();
  const remainingCount = totalTeamCount - displayCount;
  
  // Use section data if available, otherwise use defaults
  const title = section?.title || "Let's build your [[automation engine]]";
  const subtitle = section?.subtitle || "Book a free 30-minute strategy session with our team. We'll analyze your current workflow and show you exactly how automation can transform your business.";

  return (
    <section className="py-24 relative">
      {/* Background Effects */}
      <div 
        className="absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-60"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 3%, rgba(0,0,0,0.15) 8%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,1) 70%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 3%, rgba(0,0,0,0.15) 8%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,1) 70%, rgba(0,0,0,1) 100%)',
        }}
      />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Team Avatars */}
          <div className="flex justify-center -space-x-3 mb-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`w-12 h-12 rounded-full ${member.color} border-4 border-background flex items-center justify-center text-white font-semibold text-sm`}
                title={member.name}
              >
                {member.initial || member.name[0]}
              </motion.div>
            ))}
            {remainingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: displayCount * 0.1 }}
                className="w-12 h-12 rounded-full bg-secondary border-4 border-background flex items-center justify-center text-muted-foreground font-semibold text-xs"
                title={`${remainingCount} more team members`}
              >
                +{remainingCount}
              </motion.div>
            )}
          </div>

          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Ready to Transform?
          </span>
          <RichText
            as="h2"
            text={title}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6"
          />
          <RichText
            as="p"
            text={subtitle}
            className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto"
          />

          {/* CTA Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-14 bg-secondary border-border text-foreground placeholder:text-muted-foreground flex-1 w-full text-base"
            />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold whitespace-nowrap w-full sm:w-auto text-base">
                Book Free Strategy Call
              </Button>
            </motion.div>
          </motion.div>

          <p className="text-sm text-muted-foreground mt-6">
            No commitment required • Response within 24 hours
          </p>
        </motion.div>
      </div>
    </section>
  );
};

