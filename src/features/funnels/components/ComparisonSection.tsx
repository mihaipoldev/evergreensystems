"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const ComparisonSection = () => {
  return (
    <section className="section-spacing">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center md:mb-12 mb-6"
          {...fadeInUp}
        >
          <h2 className="md:heading-lg heading-md md:mb-4 mb-3">
            Why This Model Makes Sense
          </h2>
          <p className="md:body-lg body-sm text-foreground/80 max-w-3xl mx-auto">
            If you want outbound to work as a real acquisition channel, there are only three paths.
          </p>
        </motion.div>

        <motion.div 
          className="md:space-y-5 space-y-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          {/* Option 1 - DIY */}
          <motion.div 
            className="group relative overflow-hidden rounded-2xl md:p-8 p-4 hover:border-border transition-all"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                  <span className="text-xl font-bold text-foreground/70">1</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="md:heading-md heading-sm md:mb-3 mb-2">Build it yourself</h3>
                <p className="md:body-md body-sm text-foreground/80">
                  You can learn outbound internally. This usually means weeks spent learning tools, deliverability basics, and workflows. Most teams underestimate how much data quality and infrastructure discipline matter until time and reputation are already lost.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Option 2 - Agency */}
          <motion.div 
            className="group relative overflow-hidden rounded-2xl md:p-8 p-4 hover:border-border transition-all"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                  <span className="text-xl font-bold text-foreground/70">2</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="md:heading-md heading-sm md:mb-3 mb-2">Hire a typical lead generation agency</h3>
                <p className="md:body-md body-sm text-foreground/80">
                  You can outsource outbound to an agency. In most cases, you pay for activity, not outcomes. Leads are delivered without meaningful context, and the system itself is not owned by you.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Option 3 - Highlighted (Evergreen) */}
          <motion.div 
            className="relative"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
            <div className="relative overflow-hidden rounded-2xl bg-primary/5 border-2 border-primary/20 md:p-8 p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 md:mb-3 mb-2">
                    <h3 className="md:heading-md heading-sm">Run a fully managed, enriched outbound system</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-4 mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">The Evergreen Systems Model</span>
                  </div>
                  <p className="md:body-md body-sm text-foreground/90 leading-relaxed">
                    The system is built, operated, and improved for you. Data quality, enrichment, infrastructure, and execution live inside one system. <span className="font-semibold text-foreground">You focus on sales. The system handles acquisition.</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
