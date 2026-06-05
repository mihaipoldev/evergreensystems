"use client";

import { useEffect, useState } from "react";
import type { Screenshot } from "@/features/home/types";

// Browser-chrome frame with auto-crossfading screenshots (3.2s, matching the
// prototype). Client island — the rest of the Platform section is static.
export function PlatformCarousel({ screenshots }: { screenshots: Screenshot[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (screenshots.length < 2) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % screenshots.length);
    }, 3200);
    return () => clearInterval(id);
  }, [screenshots.length]);

  return (
    <figure className="platform-fig">
      <div className="browser-chrome">
        <div className="chrome-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="browser-screen">
        {screenshots.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            className={`pscreen${i === active ? " active" : ""}`}
          />
        ))}
      </div>
    </figure>
  );
}
