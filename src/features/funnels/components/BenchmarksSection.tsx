"use client";

import { motion } from "framer-motion";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import SectionEyebrow from "./SectionEyebrow";
import type { BenchmarksContent } from "../types";

interface BenchmarksSectionProps {
  content: BenchmarksContent;
}

const BenchmarksSection = ({ content }: BenchmarksSectionProps) => {
  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center md:mb-12 mb-6">
          {content.eyebrow && <SectionEyebrow label={content.eyebrow} />}
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground md:mb-2 mb-3">{content.heading}</h2>
          {content.subheading && (
            <p className="md:body-lg body-md text-foreground/80 max-w-2xl mx-auto">
              {content.subheading}
            </p>
          )}
        </div>

        {/* Benchmarks Grid */}
        <motion.div
          className="grid md:grid-cols-3 md:gap-6 gap-4 md:mb-12 mb-4"
          {...staggerContainer}
        >
          {content.benchmarks.map((benchmark, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-md transition-all"
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

              <p className="text-sm md:text-base font-medium text-foreground leading-relaxed md:mb-3 mb-2">
                {benchmark.description}
              </p>

              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benchmark.subtext}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Statement */}
        {content.bottomStatement && (
          <div className="text-center">
            <RichText
              text={content.bottomStatement}
              as="p"
              className="md:body-lg body-sm font-semibold text-foreground max-w-2xl mx-auto px-3 md:px-0"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default BenchmarksSection;
