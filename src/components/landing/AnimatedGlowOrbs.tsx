"use client";

import { motion } from 'framer-motion';

export const AnimatedGlowOrbs = () => {
  return (
    <>
      <motion.div
        className="absolute top-[20%] left-[10%] w-50 h-50 rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundColor: '#446F94',
          opacity: 0.2,
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
          backgroundColor: '#D4932C',
          opacity: 0.2,
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
