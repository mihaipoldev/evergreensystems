"use client";

// Ported from design/v1-2026-06-05/project/textures.js (terrain + field only —
// the two treatments the homepage uses). Decorative dot-matrix canvas:
//   tex="terrain" → dots dense below a ridge, dissolving upward (hero visual)
//   tex="field"   → directional dot-dissolve (guarantee / niches / CTA overlays)
//
// Differences from the prototype: one canvas per component instance (not a
// global querySelectorAll sweep); tokens are read off the canvas element
// (custom props inherit from `.eg-home`, not :root); rAF + ResizeObserver are
// cleaned up on unmount so navigating away never leaks a loop.

import { useEffect, useRef } from "react";

type Tex = "terrain" | "field";
type FieldDir = "down" | "up" | "left" | "right" | "center";

interface TextureCanvasProps {
  tex: Tex;
  color?: "ink" | "accent" | "on" | "white";
  step?: number;
  dir?: FieldDir;
  animate?: boolean;
  speed?: number;
  className?: string;
}

// ── pure math (verbatim from the prototype) ────────────────────────────
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const a = hash(xi, yi),
    b = hash(xi + 1, yi),
    c = hash(xi, yi + 1),
    d = hash(xi + 1, yi + 1);
  const u = smooth(xf),
    v = smooth(yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
function fbm(x: number, y: number) {
  let s = 0,
    amp = 0.6,
    f = 1;
  for (let i = 0; i < 4; i++) {
    s += amp * noise(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return s;
}
function ridge(t: number) {
  return (
    0.5 +
    0.2 * Math.sin(t * 6.0 + 0.5) +
    0.12 * Math.sin(t * 13.0 + 2.0) +
    0.06 * Math.sin(t * 27.0 + 1.0)
  );
}

export function TextureCanvas({
  tex,
  color = "ink",
  step,
  dir = "down",
  animate = false,
  speed = 1,
  className,
}: TextureCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animated = animate && !reduceMotion;

    const cs = getComputedStyle(canvas);
    const tok = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
    const intensity = () => {
      const v = parseFloat(cs.getPropertyValue("--tex-intensity"));
      return isNaN(v) ? 1 : v;
    };
    const terrainColor = color === "accent" ? tok("--accent", "#D4742C") : tok("--ink", "#0C2340");
    const fieldColor =
      color === "accent"
        ? tok("--accent", "#D4742C")
        : color === "on" || color === "white"
          ? tok("--on-fill", "#FFFFFF")
          : tok("--ink", "#0C2340");

    function fit() {
      const r = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas!.clientWidth,
        h = canvas!.clientHeight;
      canvas!.width = Math.max(1, Math.round(w * r));
      canvas!.height = Math.max(1, Math.round(h * r));
      const ctx = canvas!.getContext("2d")!;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      return { ctx, w, h };
    }

    function drawTerrain(animTime: number) {
      const { ctx, w, h } = fit();
      ctx.clearRect(0, 0, w, h);
      const stp = step ?? 7;
      const k = intensity();
      const t = animated ? animTime * 0.00004 * speed : 0;
      for (let y = 0; y < h; y += stp) {
        for (let x = 0; x < w; x += stp) {
          const t0 = x / w;
          const surf = ridge(t0) * h * 0.62 + h * 0.1;
          const below = y - surf;
          const n = fbm(x / 70, y / 70 + t);
          let p;
          if (below < -18) p = 0;
          else if (below < 60) p = (below + 18) / 78;
          else p = 1;
          p *= 0.55 + 0.6 * n;
          let draw: boolean, alpha: number, r: number;
          if (animated) {
            draw = hash(x * 0.91, y * 0.73) < p * 0.9 * k;
            const phase =
              x * 0.011 - y * 0.011 + animTime * 0.0013 * speed + hash(x * 1.7, y * 1.3) * 6.283;
            const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(phase));
            alpha = Math.min(1, 0.35 + 0.65 * Math.min(1, (below + 20) / 70)) * tw;
            r = Math.max(0.5, (0.9 + 1.7 * n) * Math.min(1, (below + 30) / 90));
          } else {
            draw = Math.random() < p * 0.9 * k;
            alpha = Math.min(1, 0.35 + 0.65 * Math.min(1, (below + 20) / 70));
            r = Math.max(0.5, (0.9 + 1.7 * n) * Math.min(1, (below + 30) / 90));
          }
          if (draw) {
            ctx.fillStyle = terrainColor;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 6.283);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawField(animTime: number) {
      const { ctx, w, h } = fit();
      ctx.clearRect(0, 0, w, h);
      const stp = step ?? 9;
      const k = intensity();
      const t = animated ? animTime * 0.00006 * speed : 0;
      for (let y = 0; y < h; y += stp) {
        for (let x = 0; x < w; x += stp) {
          let g: number;
          if (dir === "down") g = 1 - y / h;
          else if (dir === "up") g = y / h;
          else if (dir === "left") g = 1 - x / w;
          else if (dir === "center") {
            const dx = (x - w / 2) / (w / 2),
              dy = (y - h / 2) / (h / 2);
            g = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy));
          } else g = x / w;
          const n = fbm(x / 60 + t, y / 60 - t * 0.5);
          let draw: boolean, alpha: number, r: number;
          if (animated) {
            const dr = animTime * 0.00006 * speed;
            const macro = fbm(x / 155 + dr * 2.4, y / 155 - dr * 1.2);
            const voids = clamp((macro - 0.24) / 0.6, 0, 1);
            const fine = fbm(x / 55, y / 55);
            const pp = g * (0.45 + 0.7 * fine) * voids;
            draw = hash(x * 0.91, y * 0.73) < pp * 0.95 * k;
            const phase =
              x * 0.011 - y * 0.011 + animTime * 0.0013 * speed + hash(x * 1.7, y * 1.3) * 6.283;
            const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(phase));
            alpha = (0.3 + 0.6 * g) * tw;
            r = 0.7 + 1.6 * g * fine;
          } else {
            const p = g * (0.5 + 0.7 * n);
            draw = Math.random() < p * 0.85 * k;
            alpha = 0.3 + 0.6 * g;
            r = 0.7 + 1.6 * g * n;
          }
          if (draw) {
            ctx.fillStyle = fieldColor;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 6.283);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    const draw = tex === "terrain" ? drawTerrain : drawField;

    let raf = 0;
    let lastFrame = 0;
    function loop(ts: number) {
      if (ts - lastFrame > 38) {
        draw(ts);
        lastFrame = ts;
      }
      raf = requestAnimationFrame(loop);
    }

    // initial static render
    draw(0);
    if (animated) raf = requestAnimationFrame(loop);

    // refit + redraw on resize (debounced)
    let rt: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(() => draw(animated ? performance.now() : 0), 120);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      ro.disconnect();
    };
  }, [tex, color, step, dir, animate, speed]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
