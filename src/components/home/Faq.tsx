"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { home } from "@/features/home/content";
import { trackEvent } from "@/lib/analytics";

// FAQ in the new design language (editorial accordion: hairline rows, mono
// numbering, accent on open). Native to .eg-home — not the old shadcn component.
export function Faq() {
  const { faq } = home;
  const [open, setOpen] = useState<number | null>(null);

  function toggle(i: number) {
    const willOpen = open !== i;
    setOpen(willOpen ? i : null);
    if (willOpen) {
      const item = faq.items[i];
      // Matches the old FAQ component's tracking (entity_type: faq_item).
      trackEvent({
        event_type: "link_click",
        entity_type: "faq_item",
        entity_id: item.id,
        metadata: { question: item.q, position: i },
      });
    }
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
                  // Fires its own faq_item event on open (below) — the global
                  // SiteAnalytics click tracker must not double-count toggles.
                  data-analytics-skip="true"
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
