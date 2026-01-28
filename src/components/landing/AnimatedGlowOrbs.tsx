"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const AnimatedGlowOrbs = () => {
  const [primaryColor, setPrimaryColor] = useState<string>('hsl(var(--primary) / 0.2)');
  const [secondaryColor, setSecondaryColor] = useState<string>('hsl(var(--secondary) / 0.2)');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const primary = computedStyle.getPropertyValue('--primary').trim();
      const secondary = computedStyle.getPropertyValue('--secondary').trim();
      
      // Format as hsl() with opacity
      setPrimaryColor(`hsl(${primary} / 0.2)`);
      setSecondaryColor(`hsl(${secondary} / 0.2)`);
    };

    updateColors();

    // Watch for changes to CSS variables
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Also listen for custom events that might indicate color changes
    window.addEventListener('colorsUpdated', updateColors);

    return () => {
      observer.disconnect();
      window.removeEventListener('colorsUpdated', updateColors);
    };
  }, []);

  return (
    <>
      <motion.div
        className="absolute top-[20%] left-[10%] w-50 h-50 rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundColor: primaryColor,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundColor: secondaryColor,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </>
  );
};
