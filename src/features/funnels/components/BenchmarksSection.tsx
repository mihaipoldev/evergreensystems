"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const benchmarks = [
  {
    title: "Reply Quality",
    value: "8–15%",
    description: "of replies are context-aware, human responses",
    subtext: "Replies that reference the message, company, or problem — not auto-responses or unsubscribes.",
  },
  {
    title: "Conversation to Call",
    value: "25–40%",
    description: "of qualified conversations book a call",
    subtext: "Measured after fit checks and intent validation.",
  },
  {
    title: "Call Show-Up Rate",
    value: "75–90%",
    description: "attendance on booked calls",
    subtext: "Driven by proper framing, confirmation, and reminder logic.",
  },
  {
    title: "Time to First Signal",
    value: "7–14 days",
    description: "after system goes live",
    subtext: "Initial replies and qualified conversations indicate correct targeting.",
  },
  {
    title: "Performance Improvement",
    value: "20–40%",
    description: "improvement in reply quality within 30–60 days",
    subtext: "As targeting, enrichment, and messaging compound.",
  },
  {
    title: "Deliverability Health",
    value: "<2%",
    description: "bounce rate · <0.1% spam complaints",
    subtext: "Maintained through domain isolation and controlled sending.",
  },
];

const BenchmarksSection = () => {
  return (
    <section id="expected-outcomes" className="section-spacing">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center md:mb-12 mb-6"
          {...fadeInUp}
        >
          <h2 className="md:heading-lg heading-md md:mb-2 mb-3">Expected Outcomes</h2>
          <p className="md:body-lg body-md text-foreground/80 max-w-2xl mx-auto">
            What this system is designed to optimize for
          </p>
        </motion.div>

        {/* Main Card Container */}
        <div className="">
          
          {/* Benchmarks Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-4 md:mb-12 mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            {benchmarks.map((benchmark, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-background to-background/50 rounded-xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-start justify-between md:mb-4 mb-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {benchmark.title}
                  </p>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                </div>
                
                <p className="text-2xl md:text-4xl font-bold text-foreground md:mb-2 mb-3">
                  {benchmark.value}
                </p>
                
                <p className="md:body-sm text-sm font-medium text-foreground md:mb-3 mb-2">
                  {benchmark.description}
                </p>
                
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {benchmark.subtext}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>


          {/* Bottom Statement */}
          <motion.div 
            className="text-center"
            {...fadeInUp}
          >
            <p className="md:body-lg body-sm font-semibold text-foreground max-w-2xl mx-auto px-3 md:px-0">
              This is not a "blast leads and pray" model. It is a system designed to create <span className="text-primary">reliable sales conversations</span>, not vanity metrics.
            </p>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

export default BenchmarksSection;
