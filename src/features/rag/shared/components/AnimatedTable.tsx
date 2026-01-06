"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, isValidElement } from "react";

interface AnimatedTableProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  getKey?: (child: ReactNode, index: number) => string | number;
}

/**
 * Table container with smooth row animations and filter transitions
 * Handles enter/exit animations for table rows
 */
export function AnimatedTable({ 
  children, 
  className = "space-y-2",
  staggerDelay = 0.02,
  getKey
}: AnimatedTableProps) {
  const getItemKey = (child: ReactNode, index: number): string | number => {
    if (getKey) return getKey(child, index);
    if (isValidElement(child) && child.key) return child.key;
    return index;
  };

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {children.map((child, index) => (
          <motion.div
            key={getItemKey(child, index)}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ 
              opacity: 0, 
              y: -10,
              height: 0,
              marginBottom: 0,
              transition: { duration: 0.2 }
            }}
            transition={{
              duration: 0.3,
              delay: index * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

