/**
 * Shared animation presets for funnel pages.
 *
 * Philosophy: animate sparingly. Only card grids, hero entrance, and CTA
 * buttons get motion — everything else renders instantly.
 */

/** Fade children in one-by-one. Spread onto a parent motion.div. */
export const staggerContainer = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-80px" } as const,
  transition: { staggerChildren: 0.06 },
} as const;

/** Subtle fade + micro-scale for stagger children (cards, list items). */
export const staggerItem = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1 },
} as const;

export const staggerItemTransition = {
  duration: 0.35,
  ease: "easeOut" as const,
};

/** Hero-only: sequential fade-in on page load. */
export const heroEntrance = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

/** CTA button lift on hover. */
export const ctaHover = {
  whileHover: { y: -2 },
  transition: { type: "spring" as const, stiffness: 400, damping: 20 },
};
