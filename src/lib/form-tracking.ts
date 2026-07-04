"use client";

// Behavior-level form tracking — the funnel signal, never the content.
// Field VALUES are never read; we only record that interaction happened:
//
//   form_start   — first focus on a field of a tagged form (once per form
//                  per page view)
//   form_abandon — form was started but not submitted; sent by beacon on
//                  tab-hide/leave, once per form (metadata.typed says whether
//                  they actually typed or only focused)
//   form_submit  — the form's success path ran (called by the component,
//                  which is also where the capture backend will plug in)
//
// Forms opt in with data-analytics-form="<id>" on the <form> element.
// initFormTracking is wired by SiteAnalytics (the one per-page tracker),
// which owns the page slug; trackFormSubmit is called from form components.

import { trackEvent, trackEventBeacon } from "./analytics";

let currentPage = "";
const started = new Set<string>();
const typed = new Set<string>();
const submitted = new Set<string>();
const abandoned = new Set<string>();

/** The form id a field event belongs to, or null when it's not a tagged form. */
function formIdOf(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  if (!target.matches("input, textarea, select")) return null;
  const form = target.closest<HTMLElement>("form[data-analytics-form]");
  return form?.dataset.analyticsForm || null;
}

export function initFormTracking(pageSlug: string): () => void {
  currentPage = pageSlug;
  started.clear();
  typed.clear();
  submitted.clear();
  abandoned.clear();

  function onFocusIn(event: FocusEvent) {
    const id = formIdOf(event.target);
    if (!id || started.has(id)) return;
    started.add(id);
    const host = (event.target as Element).closest<HTMLElement>(
      "[data-analytics-section], section[id]",
    );
    const section = host?.dataset.analyticsSection || host?.id || "page";
    trackEvent({
      event_type: "form_start",
      entity_type: "form",
      entity_id: id,
      metadata: { section, page: pageSlug },
    });
  }

  function onInput(event: Event) {
    const id = formIdOf(event.target);
    if (id) typed.add(id);
  }

  // On every tab-hide/leave, flush an abandon for each form that was started
  // but neither submitted nor already reported. A later submit still fires its
  // own form_submit — treat submit as authoritative when both exist.
  function sendAbandons() {
    for (const id of started) {
      if (submitted.has(id) || abandoned.has(id)) continue;
      abandoned.add(id);
      trackEventBeacon({
        event_type: "form_abandon",
        entity_type: "form",
        entity_id: id,
        metadata: { typed: typed.has(id), page: pageSlug },
      });
    }
  }
  function onVisibilityChange() {
    if (document.visibilityState === "hidden") sendAbandons();
  }

  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("input", onInput, { capture: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", sendAbandons);

  return () => {
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("input", onInput, { capture: true });
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", sendAbandons);
  };
}

/** Called from a form component's success path (validated → success panel). */
export function trackFormSubmit(formId: string): void {
  submitted.add(formId);
  trackEvent({
    event_type: "form_submit",
    entity_type: "form",
    entity_id: formId,
    metadata: { page: currentPage },
  });
}
