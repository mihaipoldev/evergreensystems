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
    <section id="pricing" className="section-spacing">
      <div className="max-w-4xl mx-auto">
        
        {/* What's Included */}
        <div className="md:mb-12 mb-6">
          <motion.div 
            className="text-center md:mb-10 mb-6"
            {...fadeInUp}
          >
            <h3 className="md:heading-lg heading-md md:mb-3 mb-2">What's Included</h3>
            <p className="md:body-md body-sm text-foreground/70">Everything you need for a fully managed outbound system</p>
          </motion.div>
          
          <div className="rounded-2xl">
            <motion.div 
              className="grid md:grid-cols-2 md:gap-4 gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ staggerChildren: 0.1 }}
            >
              {pricingIncludes.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start gap-3 md:p-4 p-3 rounded-lg bg-primary/5 border border-border/30 hover:border-primary/30 hover:shadow-sm transition-all"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="md:body-sm text-sm text-foreground font-medium">{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Pricing Info */}
        <motion.div 
          className="max-w-3xl mx-auto text-center md:mb-24 mb-12"
          {...fadeInUp}
        >
          <p className="md:body-sm text-sm leading-relaxed">
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
          <div className="relative bg-primary/5 rounded-2xl md:p-8 p-4 md:p-10 border-2 border-primary/20">
            
            <div className="hero-align md:mb-8 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-4 mb-3">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Performance Guarantee</span>
              </div>
              <h3 className="md:heading-lg heading-md md:mb-3 mb-2">We Remove the Downside Completely</h3>
            </div>
            
            {/* Guarantee Steps */}
            <motion.div 
              className="md:space-y-4 space-y-3 md:mb-8 mb-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div 
                className="flex items-start gap-4 md:p-4 p-3 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  1
                </div>
                <p className="md:body-md body-sm">
                  You pay a <span className="font-semibold text-foreground">one-time setup fee</span> to build the system
                </p>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4 md:p-4 p-3 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                  2
                </div>
                <p className="md:body-md body-sm">
                  Once the system goes live, <span className="font-semibold text-foreground">monthly management begins</span>
                </p>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-4 md:p-4 p-3 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                  3
                </div>
                <p className="md:body-md body-sm">
                  If the system does <span className="font-semibold text-foreground">not produce at least 10 qualified sales calls within 30 days</span> of going live: <span className="font-bold text-foreground">both the setup fee and the first month's management fee are fully refunded</span>
                </p>
              </motion.div>
            </motion.div>

            {/* Benefits List */}
            <div className="md:space-y-2 space-y-1.5 md:mb-6 mb-4 hero-align">
              <p className="md:body-sm text-sm text-foreground/80">✓ No long-term contracts</p>
              <p className="md:body-sm text-sm text-foreground/80">✓ No hidden conditions</p>
              <p className="md:body-sm text-sm text-foreground/80">✓ No paying for activity instead of outcomes</p>
            </div>

            {/* Bottom Statement */}
            <div className="md:pt-6 pt-4 border-t border-primary/20">
              <p className="md:body-lg body-md font-semibold text-foreground hero-align">
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
