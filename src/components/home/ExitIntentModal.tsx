"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { home } from "@/features/home/content";
import { Icon } from "./icons";

// Exit-intent modal — opens once per session when the cursor leaves the top of
// the viewport. Design-only: the email form validates then shows a success
// line, no network call yet (capture backend is a separate follow-up).
const SEEN_KEY = "ev_exit_shown";

export function ExitIntentModal() {
  const { exitIntent: x } = home;
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) shown.current = true;
    } catch {
      // sessionStorage unavailable (private mode) — modal can still show once
    }

    function onMouseOut(e: MouseEvent) {
      if (shown.current) return;
      if (e.clientY <= 0 && !e.relatedTarget) {
        shown.current = true;
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          // ignore
        }
        setOpen(true);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>('input[type="email"]');
    if (input && !input.checkValidity()) {
      input.reportValidity();
      return;
    }
    setDone(true);
  }

  return (
    <div
      className={`exit-modal${open ? " is-open" : ""}`}
      aria-hidden={!open}
      data-analytics-section="exit-intent"
    >
      <div className="exit-backdrop" onClick={() => setOpen(false)} />
      <div className="exit-card" role="dialog" aria-modal="true" aria-label={x.heading}>
        <button className="exit-x" aria-label="Close" onClick={() => setOpen(false)}>
          <Icon name="x" />
        </button>

        <div className="exit-left">
          <div className="ex-k">{x.guaranteeKicker}</div>
          <div className="ex-num">
            {x.guaranteeNumLines.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < x.guaranteeNumLines.length - 1 && <br />}
              </Fragment>
            ))}
          </div>
          <p className="ex-sub">{x.guaranteeSub}</p>
          <div className="ex-tags">
            {x.guaranteeTags.map((t, i) => (
              <span key={i}>
                <Icon name={t.icon} /> {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="exit-right">
          <div className="t-kicker eyebrow">{x.eyebrow}</div>
          <h2>{x.heading}</h2>
          <p>{x.body}</p>
          {done ? (
            <div className="cap-ok">
              <Icon name="check-circle-2" /> <span>{x.success}</span>
            </div>
          ) : (
            <>
              <form className="exit-form" onSubmit={onSubmit}>
                <input
                  type="email"
                  className="ev-input"
                  name="email"
                  placeholder={x.emailPlaceholder}
                  required
                  aria-label="Work email"
                />
                <button
                  type="submit"
                  className="btn btn-solid"
                  data-analytics-type="cta_button"
                  data-analytics-id={x.submitId}
                  data-analytics-label={x.submit}
                >
                  {x.submit} <Icon name="arrow-right" />
                </button>
              </form>
              <p className="exit-foot">
                {x.footPrefix}
                <a href={x.footHref} target="_blank" rel="noopener noreferrer">
                  {x.footLinkLabel} →
                </a>
              </p>
              <button className="exit-alt" type="button" onClick={() => setOpen(false)}>
                {x.dismissLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
