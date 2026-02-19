"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import type { OutcomesContent } from "../types";

interface OutcomesSectionProps {
  content: OutcomesContent;
}

const OutcomesSection = ({ content }: OutcomesSectionProps) => {
  return (
    <section id="outcomes" className="section-spacing">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center md:mb-10 mb-6">
          <h2 className="heading-md md:heading-lg mb-4">
            {content.heading}
          </h2>
          <p className="heading-sm text-muted-foreground font-normal">
            {content.subheading}
          </p>
        </div>

        {/* Benefits */}
        <motion.div
          className="md:space-y-4 space-y-2 md:mb-10 mb-6"
          {...staggerContainer}
        >
          {content.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="md:p-5 p-3 rounded-xl bg-primary/10 border border-border/50 hover:border-primary/30 transition-colors"
              variants={staggerItem}
              transition={staggerItemTransition}
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="body-md font-medium text-foreground">{benefit}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Core Value Prop */}
        <div className="md:mb-10 mb-6">
          <p className="md:body-lg body-md text-center font-medium text-foreground">
            {content.valueProp}
          </p>
          <p className="md:body-md body-sm text-center mt-3">
            {content.valueSubtext}
          </p>
        </div>

        {/* Qualifier */}
        <div className="bg-muted/50 rounded-lg md:p-5 p-3 border border-border/50">
          <RichText
            text={content.qualifierText}
            as="p"
            className="body-sm text-center text-foreground/80"
          />
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
