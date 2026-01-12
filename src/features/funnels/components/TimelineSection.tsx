"use client";

import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const timelineSteps = [
  {
    step: "Step 1",
    title: "Alignment and Discovery",
    description: "We start by aligning on your offer, ideal customer profile, and sales goals. This step ensures targeting, messaging, and qualification criteria are intentional from the beginning.",
  },
  {
    step: "Step 2",
    title: "Infrastructure Setup",
    description: "Dedicated secondary domains and sending inboxes are purchased and configured. This step exists to protect your main domain and establish a clean foundation for outbound.",
  },
  {
    step: "Step 3",
    title: "Warmup Phase",
    description: "Inboxes go through a controlled warmup period that typically lasts around 21 days. During this phase, sending reputation is built gradually to avoid spam issues.",
  },
  {
    step: "Step 4",
    title: "ICP Definition and Enrichment Logic",
    description: "While inboxes warm up, we finalize ICP rules, sourcing logic, and enrichment criteria. Leads are filtered and enriched with relevant context before outreach.",
  },
  {
    step: "Step 5",
    title: "System Build and Launch Preparation",
    description: "Messaging is written, follow ups are structured into a three step sequence, reply handling is configured, and the booking flow is set up.",
  },
  {
    step: "Step 6",
    title: "Launch and Optimization",
    description: "Campaigns go live with enriched data and controlled sending. Replies are monitored, qualified conversations are booked, and performance is continuously refined.",
  },
];

const TimelineSection = () => {
  return (
    <section className="section-spacing md:px-0 px-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          {...fadeInUp}
        >
          <h2 className="heading-lg mb-4">
            Timeline: How This Goes Live
          </h2>
          <p className="body-lg text-foreground/80 max-w-3xl mx-auto">
            A structured rollout designed to protect deliverability, ensure data quality, and avoid rushed launches that break systems.
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <motion.div 
          className="space-y-6 mb-12 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          {timelineSteps.map((item, index) => (
            <motion.div 
              key={index} 
              className="flex gap-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-base text-primary-foreground shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>
                </div>
                {index < timelineSteps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-transparent mt-3" />
                )}
              </div>
              
              {/* Content Card */}
              <div className="flex-1 pb-2">
                <div className="group h-full px-6 mb-6 rounded-xl transition-all">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{item.step}</p>
                  <h3 className="heading-sm mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="body-md text-foreground/80 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Success Definition */}
        <motion.div 
          className="relative mt-20"
          {...fadeInUp}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-2xl" />
          <div className="relative p-8 md:p-10 bg-primary/5 rounded-2xl border-2 border-primary/20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Success Metrics</span>
              </div>
              <h3 className="heading-md mb-4">What Success Looks Like</h3>
              <p className="body-md leading-relaxed">
                The system is live and producing qualified sales conversations on a consistent basis. We do not measure success by emails sent or activity levels. We measure it by <span className="font-semibold text-foreground">real conversations with decision-makers</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TimelineSection;
