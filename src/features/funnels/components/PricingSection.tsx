"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const pricingIncludes = [
  "ICP research and targeting",
  "Lead sourcing and AI driven enrichment",
  "Dedicated sending inboxes",
  "Deliverability focused sending infrastructure",
  "Campaign setup and execution",
  "Reply handling and qualification",
  "Calendar booking flow",
  "Ongoing optimization based on real reply data",
];

const pricingFactors = [
  "Target market and ICP complexity",
  "Outreach volume required to meet your goals",
  "Level of enrichment and personalization needed",
  "Sales capacity and desired pace of growth",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-spacing md:px-0 px-3">
      <div className="max-w-4xl mx-auto">
        
        {/* What's Included */}
        <div className="mb-12">
          <motion.div 
            className="text-center mb-10"
            {...fadeInUp}
          >
            <h3 className="heading-lg mb-3">What's Included</h3>
            <p className="body-md text-foreground/70">Everything you need for a fully managed outbound system</p>
          </motion.div>
          
          <div className="rounded-2xl">
            <motion.div 
              className="grid md:grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.1 }}
            >
              {pricingIncludes.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-border/30 hover:border-primary/30 hover:shadow-sm transition-all"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="body-sm text-foreground font-medium">{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Pricing Info */}
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-24"
          {...fadeInUp}
        >
          <p className="body-sm leading-relaxed">
            Because every outbound system is built differently, pricing is aligned after a short qualification call.
          <br />
          <b className="text-primary">No generic packages. Only what fits your business.</b>
          </p>
        </motion.div>

        {/* Performance Guarantee */}
        <motion.div 
          className="relative"
          {...fadeInUp}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
          <div className="relative bg-primary/5 rounded-2xl p-8 md:p-10 border-2 border-primary/20">
            
            <div className="hero-align mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Performance Guarantee</span>
              </div>
              <h3 className="heading-lg mb-3">We Remove the Downside Completely</h3>
            </div>
            
            {/* Guarantee Steps */}
            <motion.div 
              className="space-y-4 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div 
                className="flex items-start gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <p className="body-md">
                  You pay a <span className="font-semibold text-foreground">one-time setup fee</span> to build the system
                </p>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <p className="body-md">
                  Once the system goes live, <span className="font-semibold text-foreground">monthly management begins</span>
                </p>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4 p-4 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <p className="body-md">
                  If the system does <span className="font-semibold text-foreground">not produce at least 10 qualified sales calls within 30 days</span> of going live: <span className="font-bold text-foreground">both the setup fee and the first month's management fee are fully refunded</span>
                </p>
              </motion.div>
            </motion.div>

            {/* Benefits List */}
            <div className="space-y-2 mb-6 hero-align">
              <p className="body-sm text-foreground/80">✓ No long-term contracts</p>
              <p className="body-sm text-foreground/80">✓ No hidden conditions</p>
              <p className="body-sm text-foreground/80">✓ No paying for activity instead of outcomes</p>
            </div>

            {/* Bottom Statement */}
            <div className="pt-6 border-t border-primary/20">
              <p className="body-lg font-semibold text-foreground hero-align">
                You are paying for results, not promises.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
