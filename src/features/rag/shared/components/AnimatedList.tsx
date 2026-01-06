"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, isValidElement } from "react";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  layout?: boolean;
  getKey?: (child: ReactNode, index: number) => string | number;
}

/**
 * Container for lists that need smooth filter transitions
 * Handles enter/exit animations when items are filtered
 */
export function AnimatedList({ 
  children, 
  className,
  staggerDelay = 0.03,
  layout = true,
  getKey
}: AnimatedListProps) {
  const getItemKey = (child: ReactNode, index: number): string | number => {
    if (getKey) return getKey(child, index);
    if (isValidElement(child) && child.key) return child.key;
    return index;
  };

  return (
    <AnimatePresence mode="popLayout">
      {children.map((child, index) => (
        <motion.div
          key={getItemKey(child, index)}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.95,
            height: 0,
            marginBottom: 0,
            transition: { duration: 0.2 }
          }}
          layout={layout}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={className}
        >
          {child}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

