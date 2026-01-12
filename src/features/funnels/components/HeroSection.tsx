"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const HeroSection = () => {
  return (
    <section className="pt-32 md:pt-40 py-4 md:py-8 text-center">
      {/* Headline */}
      <motion.div 
        className="max-w-5xl mx-auto mb-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="heading-xl text-[20px] md:text-[60px] font-bold md:mb-6 mb-4">
          We Build & Run Outbound Systems That <b className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Books Qualified Sales Calls</b>
        </h1>
        <p className="body-lg text-[14px] md:text-[16px] px-4 md:px-0 max-w-2xl mx-auto">
          An always-on outbound system powered by AI-driven enrichment—so every sales conversation starts with real context, not guesswork.
        </p>
      </motion.div>

      {/* VSL Video Player */}
      <motion.div 
        className="max-w-4xl mx-auto mb-10 md:mb-10 md:px-0 px-3"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border shadow-sm ">
          {/* Video placeholder - replace with actual video embed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className="w-0 h-0 border-l-[20px] border-l-primary border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
              <p className="body-sm">Watch the overview</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="inline-block"
        >
          <Button variant="cta" size="xl" className="hover:bg-primary hover:-translate-y-0">
            Book a Qualification Call
            <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="heading-sm text-muted-foreground/80 max-w-2xl mx-auto mt-4">
          10 booked calls a month <b className="text-primary">guaranteed!</b>
        </p>

      </motion.div>
    </section>
  );
};

export default HeroSection;
