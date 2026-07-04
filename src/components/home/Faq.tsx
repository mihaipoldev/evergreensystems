"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { home } from "@/features/home/content";

// Homepage FAQ — the editorial accordion (mono numbering, hairline rows, accent
// on open). Content comes from home.faq (the single source shared with the
// article-page FAQ, which renders the same content in a different design).
export function Faq() {
  const { faq } = home;
  const [open, setOpen] = useState<number | null>(null);

  function toggle(i: number) {
    setOpen(open === i ? null : i);
  }

  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <div className="shead">
          <div className="t-kicker eyebrow">{faq.eyebrow}</div>
          <h2>
            <span className="em">{faq.headingEm}</span>{" "}
            <span className="dim">{faq.headingDim}</span>
          </h2>
        </div>

        <div className="faq-list">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            const btnId = `faq-q-${i}`;
            return (
              <div className={`faq-item${isOpen ? " open" : ""}`} key={i}>
                <button
                  id={btnId}
                  className="faq-q"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  data-analytics-type="faq_item"
                  data-analytics-id={item.id}
                  data-analytics-label={item.q}
                  onClick={() => toggle(i)}
                >
                  <span className="faq-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="faq-qtext">{item.q}</span>
                  <ChevronDown className="faq-chevron" aria-hidden="true" />
                </button>
                <div className="faq-a" id={panelId} role="region" aria-labelledby={btnId}>
                  <div className="faq-a-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
