"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] as const }
};

const FinalCTASection = () => {
  return (
    <section className="section-spacing md:px-0 px-3">
      <div className="max-w-4xl mx-auto">
        {/* Main CTA Container */}
        <div className="text-center">
          
          {/* Heading */}
          <motion.h2 
            className="heading-xl mb-4"
            {...fadeInUp}
          >
            Start Getting Qualified Calls
          </motion.h2>
          
          <motion.p 
            className="body-lg mb-10 max-w-2xl mx-auto"
            {...fadeInUp}
          >
            Book a no-pressure strategy call to see if this system is the right fit for your business.
          </motion.p>

          {/* Risk Reversal Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-4 mb-10 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren: 0.15 }}
          >
            <motion.div 
              className="p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 text-left"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-muted-foreground mb-2">WORST CASE</p>
              <p className="body-sm text-foreground">
                You walk away with a clearer outbound strategy and a better understanding of what would actually work for your business.
              </p>
            </motion.div>
            <motion.div 
              className="p-6 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 text-left"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-semibold text-primary mb-2">BEST CASE</p>
              <p className="body-sm text-foreground">
                You install a predictable, enriched acquisition system that books qualified sales conversations consistently.
              </p>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="inline-block"
            >
              <Button variant="cta" size="xl" className="shadow-lg hover:bg-primary hover:shadow-xl transition-shadow hover:-translate-y-0">
                Book a Strategy Call
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Subtext */}
          <motion.p 
            className="body-sm text-muted-foreground"
            {...fadeInUp}
          >
            No pressure. No commitment. <br />Just a clear conversation about whether this system fits your business.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
