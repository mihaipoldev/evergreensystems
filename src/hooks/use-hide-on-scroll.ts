"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const TOP_THRESHOLD = 10; // always visible while within this many px of the top
const HIDE_AFTER = 30; // must be scrolled past this before hiding kicks in

// Hides a fixed/sticky header when scrolling DOWN and reveals it when scrolling
// UP — mobile only (always returns false on desktop). Mirrors the behaviour
// already shipped inline in landing/Navbar so every public header matches.
export function useHideOnScroll(): boolean {
  const isMobile = useIsMobile();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !isMobile) return;

    const handleScroll = () => {
      const y = window.scrollY;
      if (y < TOP_THRESHOLD) {
        setHidden(false);
      } else if (y > lastScrollY.current && y > HIDE_AFTER) {
        // scrolling down, past the hide threshold
        setHidden(true);
      } else if (y < lastScrollY.current) {
        // scrolling up
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // never hide on desktop, even if a stale value lingers from a resize
  return isMobile && hidden;
}
