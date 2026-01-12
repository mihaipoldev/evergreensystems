"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const deliverables = [
  "ICP research and buyer definition aligned to your offer",
  "Lead sourcing for your exact target accounts",
  "AI driven lead filtering and enrichment before any outreach",
  "Purchase and setup of dedicated secondary domains",
  "Creation of sending inboxes under those domains",
  "Deliverability and authentication configuration for sending domains",
  "Inbox warmup, reputation protection and sending safeguards",
  "Connection to a centralized sending platform",
  "Campaign setup using a structured three step sequence",
  "Ongoing campaign execution and follow ups",
  "Reply handling and basic qualification",
  "Sales calls booked directly to your calendar",
  "Continuous optimization based on real reply data",
];

const WhatYouGetSection = () => {
  return (
    <section id="what-you-get" className="section-spacing">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center md:mb-12 mb-6"
          {...fadeInUp}
        >
          <h2 className="md:heading-lg heading-md md:mb-4 mb-3">
            What You Get <b className="text-primary">Done For You</b>
          </h2>
          <p className="md:body-lg body-md text-foreground/80 max-w-2xl mx-auto">
            A fully managed outbound system built, operated, and optimized on your behalf.<br />
          </p>
        </motion.div>

        {/* Deliverables Grid */}
        <div className="md:mb-12 mb-6">
          <div className="rounded-2xl ">
            <motion.div 
              className="grid md:grid-cols-2 md:gap-4 gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.08 }}
            >
              {deliverables.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-3 md:p-4 p-3 rounded-xl bg-background/70 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-background transition-all group"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="md:body-sm text-sm text-foreground font-medium leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </motion.div>

          {/* Bottom Statement - Enhanced */}
          <motion.div 
            className="relative md:mt-8 mt-6"
            {...fadeInUp}
          >
            <div className="absolute inset-0 md:mt-8 mt-6" />
            <div className="relative">
              <div className="text-center max-w-2xl mx-auto md:space-y-3 space-y-2">
                <div className="md:space-y-2 space-y-1.5 md:mb-6 mb-4">
                  <p className="md:body-md body-sm text-foreground/80">✗ You do not manage tools</p>
                  <p className="md:body-md body-sm text-foreground/80">✗ You do not chase leads</p>
                  <p className="md:body-md body-sm text-foreground/80">✗ You do not babysit campaigns</p>
                </div>
                
                <div className="md:pt-6 pt-4 border-t border-primary/20">
                  <p className="md:heading-md heading-sm text-foreground">
                    You show up to qualified conversations.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
