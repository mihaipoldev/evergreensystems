"use client";

import { motion } from "framer-motion";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import type { TimelineContent } from "../types";

interface TimelineSectionProps {
  content: TimelineContent;
}

const TimelineSection = ({ content }: TimelineSectionProps) => {
  return (
    <section className="section-spacing">
      <div className="max-w-4xl mx-auto px-3 md:px-0">
        {/* Header */}
        <div className="text-center md:mb-12 mb-6">
          <h2 className="md:heading-lg heading-md md:mb-4 mb-3">
            {content.heading}
          </h2>
          <p className="md:body-lg body-md text-foreground/80 max-w-3xl mx-auto">
            {content.subheading}
          </p>
        </div>

        {/* Timeline Steps */}
        <motion.div
          className="md:space-y-6 space-y-4 md:mb-12 mb-6 max-w-2xl mx-auto"
          {...staggerContainer}
        >
          {content.steps.map((item, index) => (
            <motion.div
              key={index}
              className="flex md:gap-6 gap-2"
              variants={staggerItem}
              transition={staggerItemTransition}
            >
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold md:text-base text-sm text-primary-foreground shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>
                </div>
                {index < content.steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-transparent md:mt-3 mt-2" />
                )}
              </div>

              {/* Content Card */}
              <div className="flex-1 pb-2">
                <div className="group h-full md:px-6 px-4 md:mb-6 mb-4 rounded-xl transition-all">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider md:mb-2 mb-1">{item.step}</p>
                  <h3 className="md:heading-sm text-sm font-semibold md:mb-3 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="md:body-md body-sm text-foreground/80 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Success Definition */}
        <div className="relative md:mt-20 mt-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-2xl" />
          <div className="relative md:p-8 p-4 md:p-10 bg-primary/5 rounded-2xl border-2 border-primary/20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-4 mb-3">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{content.successBox.badgeText}</span>
              </div>
              <h3 className="md:heading-md heading-sm md:mb-4 mb-3">{content.successBox.heading}</h3>
              <RichText
                text={content.successBox.text}
                as="p"
                className="md:body-md body-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
