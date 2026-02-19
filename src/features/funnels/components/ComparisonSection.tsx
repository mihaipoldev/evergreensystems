"use client";

import { motion } from "framer-motion";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import type { ComparisonContent } from "../types";

interface ComparisonSectionProps {
  content: ComparisonContent;
}

const ComparisonSection = ({ content }: ComparisonSectionProps) => {
  return (
    <section className="section-spacing">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center md:mb-12 mb-6">
          <h2 className="md:heading-lg heading-md md:mb-4 mb-3">
            {content.heading}
          </h2>
          <p className="md:body-lg body-sm text-foreground/80 max-w-3xl mx-auto">
            {content.subheading}
          </p>
        </div>

        <motion.div
          className="md:space-y-5 space-y-2"
          {...staggerContainer}
        >
          {content.cards.map((card, index) => (
            card.highlighted ? (
              <motion.div
                key={index}
                className="relative"
                variants={staggerItem}
                transition={staggerItemTransition}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
                <div className="relative overflow-hidden rounded-2xl bg-primary/5 border-2 border-primary/20 md:p-8 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                        <span className="text-xl font-bold text-primary">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 md:mb-3 mb-2">
                        <h3 className="md:heading-md heading-sm">{card.title}</h3>
                      </div>
                      {card.badge && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-4 mb-3">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{card.badge}</span>
                        </div>
                      )}
                      <RichText
                        text={card.description}
                        as="p"
                        className="md:body-md body-sm text-foreground/90 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-2xl md:p-8 p-4 hover:border-border transition-all"
                variants={staggerItem}
                transition={staggerItemTransition}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border/50">
                      <span className="text-xl font-bold text-foreground/70">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="md:heading-md heading-sm md:mb-3 mb-2">{card.title}</h3>
                    <p className="md:body-md body-sm text-foreground/80">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
