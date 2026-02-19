"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import type { WhatYouGetContent } from "../types";

interface WhatYouGetSectionProps {
  content: WhatYouGetContent;
}

const WhatYouGetSection = ({ content }: WhatYouGetSectionProps) => {
  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center md:mb-12 mb-6">
          <RichText
            text={content.heading}
            as="h2"
            className="md:heading-lg heading-md md:mb-4 mb-3"
          />
          <p className="md:body-lg body-md text-foreground/80 max-w-2xl mx-auto">
            {content.subheading}
          </p>
        </div>

        {/* Deliverables Grid */}
        <div className="md:mb-12 mb-6">
          <div className="rounded-2xl ">
            <motion.div
              className="grid md:grid-cols-2 md:gap-4 gap-3"
              {...staggerContainer}
            >
              {content.deliverables.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 md:p-4 p-3 rounded-xl bg-background/70 backdrop-blur-sm border border-border/70 hover:border-primary/30 hover:bg-background transition-all group"
                  variants={staggerItem}
                  transition={staggerItemTransition}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="md:body-sm text-sm text-foreground font-medium leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </motion.div>

          {/* Bottom Statement */}
          <div className="relative md:mt-8 mt-6">
            <div className="absolute inset-0 md:mt-8 mt-6" />
            <div className="relative">
              <div className="text-center max-w-2xl mx-auto md:space-y-3 space-y-2">
                <div className="md:space-y-2 space-y-1.5 md:mb-6 mb-4">
                  {content.bottomNegatives.map((item, index) => (
                    <p key={index} className="md:body-md body-sm text-foreground/80">{item}</p>
                  ))}
                </div>

                <div className="md:pt-6 pt-4 border-t border-primary/20">
                  <p className="md:heading-md heading-sm text-foreground">
                    {content.closingStatement}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
