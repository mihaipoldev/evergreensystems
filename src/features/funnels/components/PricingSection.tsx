"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import type { PricingContent } from "../types";

interface PricingSectionProps {
  content: PricingContent;
}

const PricingSection = ({ content }: PricingSectionProps) => {
  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-4xl mx-auto">

        {/* What's Included */}
        <div className="md:mb-12 mb-6">
          <div className="text-center md:mb-10 mb-6">
            <h3 className="md:heading-lg heading-md md:mb-3 mb-2">{content.includedHeading}</h3>
            <p className="md:body-md body-sm text-foreground/70">{content.includedSubheading}</p>
          </div>

          <div className="rounded-2xl">
            <motion.div
              className="grid md:grid-cols-2 md:gap-4 gap-3"
              {...staggerContainer}
            >
              {content.includes.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 md:p-4 p-3 rounded-lg bg-primary/5 border border-border/30 hover:border-primary/30 hover:shadow-sm transition-all"
                  variants={staggerItem}
                  transition={staggerItemTransition}
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
        <div className="max-w-3xl mx-auto text-center md:mb-24 mb-12">
          <RichText
            text={content.pricingNote}
            as="p"
            className="md:body-sm text-sm leading-relaxed"
          />
        </div>

        {/* Performance Guarantee */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
          <div className="relative bg-primary/5 rounded-2xl md:p-8 p-4 md:p-10 border-2 border-primary/20">

            <div className="hero-align md:mb-8 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-4 mb-3">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{content.guarantee.badgeText}</span>
              </div>
              <h3 className="md:heading-lg heading-md md:mb-3 mb-2">{content.guarantee.heading}</h3>
            </div>

            {/* Guarantee Steps */}
            <motion.div
              className="md:space-y-4 space-y-3 md:mb-8 mb-6"
              {...staggerContainer}
            >
              {content.guarantee.steps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`flex items-start gap-4 md:p-4 p-3 backdrop-blur-sm rounded-xl ${
                    step.highlighted
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-background/50 border border-border/50"
                  }`}
                  variants={staggerItem}
                  transition={staggerItemTransition}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm flex-shrink-0 ${
                    step.highlighted
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {index + 1}
                  </div>
                  <RichText
                    text={step.text}
                    as="p"
                    className="md:body-md body-sm"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits List */}
            <div className="md:space-y-2 space-y-1.5 md:mb-6 mb-4 hero-align">
              {content.guarantee.benefits.map((benefit, index) => (
                <p key={index} className="md:body-sm text-sm text-foreground/80">{benefit}</p>
              ))}
            </div>

            {/* Bottom Statement */}
            <div className="md:pt-6 pt-4 border-t border-primary/20">
              <p className="md:body-lg body-md font-semibold text-foreground hero-align">
                {content.guarantee.closingStatement}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
