"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionWrapperProps {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const SectionWrapper = ({
  id,
  number,
  title,
  subtitle,
  children,
}: SectionWrapperProps) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="mb-16 scroll-mt-8"
    >
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-baseline gap-2 md:gap-4 mb-3">
          <span className="text-lg md:text-3xl font-display font-light text-accent">
            {number}
          </span>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-semibold text-primary">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-muted-foreground font-body pl-0 md:pl-12 text-sm md:text-base">{subtitle}</p>
        )}
        <div className="mt-4 pl-0 md:pl-12">
          <div className="w-12 md:w-16 h-0.5 bg-accent" />
        </div>
      </div>

      {/* Section Content */}
      <div className="pl-0 md:pl-12">{children}</div>
    </motion.section>
  );
};

