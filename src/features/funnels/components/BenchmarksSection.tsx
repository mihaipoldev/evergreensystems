"use client";

import { motion } from "framer-motion";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import type { BenchmarksContent } from "../types";

interface BenchmarksSectionProps {
  content: BenchmarksContent;
}

const BenchmarksSection = ({ content }: BenchmarksSectionProps) => {
  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center md:mb-12 mb-6">
          <h2 className="md:heading-lg heading-md md:mb-2 mb-3">{content.heading}</h2>
          <p className="md:body-lg body-md text-foreground/80 max-w-2xl mx-auto">
            {content.subheading}
          </p>
        </div>

        {/* Benchmarks Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-4 md:mb-12 mb-4"
          {...staggerContainer}
        >
          {content.benchmarks.map((benchmark, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-background to-background/50 rounded-xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
              variants={staggerItem}
              transition={staggerItemTransition}
            >
              <div className="flex items-start justify-between md:mb-4 mb-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {benchmark.title}
                </p>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                </div>
              </div>

              <p className="text-2xl md:text-4xl font-bold text-foreground md:mb-2 mb-3">
                {benchmark.value}
              </p>

              <p className="md:body-sm text-sm font-medium text-foreground md:mb-3 mb-2">
                {benchmark.description}
              </p>

              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {benchmark.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Statement */}
        <div className="text-center">
          <RichText
            text={content.bottomStatement}
            as="p"
            className="md:body-lg body-sm font-semibold text-foreground max-w-2xl mx-auto px-3 md:px-0"
          />
        </div>
      </div>
    </section>
  );
};

export default BenchmarksSection;
