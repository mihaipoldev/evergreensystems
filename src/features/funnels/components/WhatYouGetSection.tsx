"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import SectionEyebrow from "./SectionEyebrow";
import type { WhatYouGetContent } from "../types";

interface WhatYouGetSectionProps {
  content: WhatYouGetContent;
}

const WhatYouGetSection = ({ content }: WhatYouGetSectionProps) => {
  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center md:mb-12 mb-6">
          {content.eyebrow && <SectionEyebrow label={content.eyebrow} />}
          <RichText
            text={content.heading}
            as="h2"
            className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground md:mb-4 mb-3"
          />
          {content.subheading && (
            <p className="md:body-lg body-md text-foreground/80 max-w-2xl mx-auto">
              {content.subheading}
            </p>
          )}
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
                  <p className="text-sm md:text-base text-foreground font-medium leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </motion.div>

          {/* Bottom Statement */}
          <div className="text-center max-w-2xl mx-auto md:mt-8 mt-6">
            {content.bottomNegatives.length > 0 && (
              <p className="text-sm md:text-base text-muted-foreground md:mb-6 mb-4 px-4">
                <span className="text-foreground/60">You don&apos;t </span>
                {content.bottomNegatives
                  .map((item) => item.replace(/^[✗✘×x✗\s]*(?:You do not\s+)?/i, ""))
                  .join("  ·  ")}
              </p>
            )}

            <div className={content.bottomNegatives.length > 0 ? "md:pt-6 pt-4 border-t border-primary/20" : ""}>
              <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
                {content.closingStatement}
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouGetSection;
