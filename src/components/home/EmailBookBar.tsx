"use client";

import { home } from "@/features/home/content";
import { trackFormSubmit } from "@/lib/form-tracking";

// Reusable inline email pill: capture intent, then route to the booking link.
// Renders just the pill (optionally with a lead line) so it can drop inside any
// existing section. Design-only for now — no persistence; when the capture
// backend is wired, POST the email inside onSubmit before opening the link.
interface EmailBookBarProps {
  /** Optional line above the pill. Pass "" to hide it. */
  lead?: string;
  placeholder?: string;
  buttonLabel?: string;
  buttonId?: string;
  href?: string;
}

export function EmailBookBar({ lead, placeholder, buttonLabel, buttonId, href }: EmailBookBarProps) {
  const b = home.bookBar;
  const leadText = lead ?? b.lead;
  const placeholderText = placeholder ?? b.placeholder;
  const label = buttonLabel ?? b.buttonLabel;
  const id = buttonId ?? b.buttonId;
  const url = href ?? b.href;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>('input[type="email"]');
    if (input && !input.checkValidity()) {
      input.reportValidity();
      return;
    }
    trackFormSubmit("bookbar");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {leadText && <p className="bookbar-lead">{leadText}</p>}
      <form className="bookbar-pill" data-analytics-form="bookbar" onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          className="bookbar-input"
          placeholder={placeholderText}
          required
          aria-label="Work email"
        />
        <button
          type="submit"
          className="bookbar-btn"
          data-analytics-type="cta_button"
          data-analytics-id={id}
          data-analytics-label={label}
        >
          {label}
        </button>
      </form>
    </>
  );
}
