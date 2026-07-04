"use client";

import { useState } from "react";
import { home } from "@/features/home/content";

// Article/insights FAQ — the plus/minus card accordion (.afaq design). Renders
// the SAME content as the homepage FAQ (home.faq.items, the single source), but
// in a different look. One content source, two designs.
export function ArticleFaq() {
  const { faq } = home;
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="afaq" id="faq" data-analytics-section="faq">
      <div className="afaq-head">
        <div className="t-kicker eyebrow">{faq.eyebrow}</div>
        <h2>
          <span className="em">{faq.headingEm}</span>{" "}
          <span className="dim">{faq.headingDim}</span>
        </h2>
      </div>

      {faq.items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`afaq-item${isOpen ? " open" : ""}`} key={item.id}>
            <button
              className="afaq-q"
              aria-expanded={isOpen}
              data-analytics-type="faq_item"
              data-analytics-id={item.id}
              data-analytics-label={item.q}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              {item.q} <span className="afaq-pm" aria-hidden="true" />
            </button>
            <div className="afaq-a">
              <div className="afaq-a-inner">
                <div>{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
