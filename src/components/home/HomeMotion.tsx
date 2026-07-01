"use client";

import { useEffect } from "react";

// Homepage motion — scroll-reveal + stat count-up, reimplemented for React
// (ported from the Claude Design polish engine, without its Tweaks harness).
// Renders nothing; it wires observers on mount and tears them down on unmount.
// Fully gated on prefers-reduced-motion, and it only ever hides elements that
// start BELOW the fold, so with JS off (or reduced motion) the page is the
// plain static layout — no flash, no hidden content.
const REVEAL_SELECTORS = [
  ".shead",
  ".outcome",
  ".platform-copy",
  ".platform-fig",
  ".sysstage",
  ".sysimg",
  ".guarantee .wrap > div",
  ".niche",
  ".close-body > div",
  ".price-card",
  ".pillar-row",
];

export function HomeMotion() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanups: Array<() => void> = [];

    // ── scroll reveal ──────────────────────────────────────────────────
    const vh = window.innerHeight;
    const revealEls: HTMLElement[] = [];
    REVEAL_SELECTORS.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el, idx) => {
        // only reveal what's still below the fold — never hide visible content
        if (el.getBoundingClientRect().top < vh * 0.92) return;
        el.classList.add("eg-rv");
        el.style.setProperty("--rv-d", `${Math.min(idx, 4) * 70}ms`);
        revealEls.push(el);
      });
    });
    if (revealEls.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            io.unobserve(el);
            el.classList.add("eg-rv-in");
            // drop the classes after the transition so original styles return
            window.setTimeout(() => {
              el.classList.remove("eg-rv", "eg-rv-in");
              el.style.removeProperty("--rv-d");
            }, 1100);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
      );
      revealEls.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // ── stat count-up (Outcomes numbers) ───────────────────────────────
    const countEls: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>(".outcome .n").forEach((n) => {
      const first = n.firstChild;
      if (!first || first.nodeType !== Node.TEXT_NODE) return;
      const m = (first.textContent || "").match(/^(\d+)(.*)$/);
      if (!m) return; // non-numeric ("Always") stays as-is
      const span = document.createElement("span");
      span.className = "eg-cu";
      span.dataset.end = m[1];
      span.dataset.suffix = m[2] || "";
      span.textContent = first.textContent || "";
      n.replaceChild(span, first);
      countEls.push(span);
    });
    if (countEls.length) {
      const run = (el: HTMLElement) => {
        const end = parseInt(el.dataset.end || "0", 10);
        const suf = el.dataset.suffix || "";
        if (!end) {
          el.textContent = end + suf;
          return;
        }
        const dur = 1100;
        let t0: number | null = null;
        const frame = (ts: number) => {
          if (t0 === null) t0 = ts;
          const p = Math.min(1, (ts - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          el.textContent = Math.round(end * eased) + suf;
          if (p < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      };
      const cuIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            cuIO.unobserve(e.target);
            run(e.target as HTMLElement);
          });
        },
        { threshold: 0.6 },
      );
      countEls.forEach((el) => cuIO.observe(el));
      cleanups.push(() => cuIO.disconnect());
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
