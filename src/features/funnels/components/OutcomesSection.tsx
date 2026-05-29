"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import SectionEyebrow from "./SectionEyebrow";
import type { OutcomesContent } from "../types";

interface OutcomesSectionProps {
  content: OutcomesContent;
}

const OutcomesSection = ({ content }: OutcomesSectionProps) => {
  return (
    <section id="outcomes" className="section-spacing">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center md:mb-12 mb-8">
          {content.eyebrow && <SectionEyebrow label={content.eyebrow} />}
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground md:mb-4 mb-3">
            {content.heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {content.subheading}
          </p>
        </div>

        {/* Benefits */}
        <motion.div
          className="md:space-y-3 space-y-2 md:mb-12 mb-8"
          {...staggerContainer}
        >
          {content.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="md:p-5 p-3 rounded-xl bg-background/70 backdrop-blur-sm border border-border/70 hover:border-primary/30 hover:bg-background hover:shadow-sm transition-all group"
              variants={staggerItem}
              transition={staggerItemTransition}
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                  <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm md:text-base text-foreground font-medium leading-relaxed">{benefit}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Core Value Prop */}
        <div className="text-center md:mb-12 mb-8">
          <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
            {content.valueProp}
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-2">
            {content.valueSubtext}
          </p>
          {content.qualifiedDefinition && (
            <p className="text-xs md:text-sm text-muted-foreground italic leading-relaxed mt-3 max-w-xl mx-auto">
              {content.qualifiedDefinition}
            </p>
          )}
        </div>

        {/* Qualifier */}
        <div className="bg-muted rounded-lg md:p-5 p-4 border border-border">
          <RichText
            text={content.qualifierText}
            as="p"
            className="text-sm text-center text-foreground leading-relaxed"
          />
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
