"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, isValidElement } from "react";

interface AnimatedGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  itemClassName?: string;
  getKey?: (child: ReactNode, index: number) => string | number;
}

/**
 * Grid container with smooth entrance animations and filter transitions
 * Perfect for card grids that need to animate in and out
 */
export function AnimatedGrid({ 
  children, 
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
  staggerDelay = 0.03,
  itemClassName,
  getKey
}: AnimatedGridProps) {
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            transition={{
              duration: 0.4,
              delay: index * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
            layout
            className={itemClassName}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

