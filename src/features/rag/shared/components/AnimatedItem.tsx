"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedItemProps {
  children: ReactNode;
  index?: number;
  delay?: number;
  className?: string;
}

/**
 * Wrapper component for items that need smooth entrance animations
 * Supports stagger delay based on index
 */
export function AnimatedItem({ 
  children, 
  index = 0, 
  delay = 0.03,
  className 
}: AnimatedItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.4,
        delay: index * delay,
        ease: [0.16, 1, 0.3, 1], // Custom easing for smooth feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

