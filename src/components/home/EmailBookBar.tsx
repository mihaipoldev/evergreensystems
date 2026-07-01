"use client";

import { home } from "@/features/home/content";

// Reusable inline email pill: capture intent, then route to the booking link.
// Design-only for now — no persistence; when the capture backend is wired,
// POST the email inside onSubmit before opening the booking link. Props let it
// drop into any placement (defaults come from content.ts `bookBar`).
interface EmailBookBarProps {
  lead?: string;
  placeholder?: string;
  buttonLabel?: string;
  buttonId?: string;
  href?: string;
  /** Analytics section slug for this placement. */
  section?: string;
}

export function EmailBookBar({
  lead,
  placeholder,
  buttonLabel,
  buttonId,
  href,
  section = "book-bar",
}: EmailBookBarProps) {
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
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="bookbar" data-analytics-section={section}>
      <div className="wrap">
        {leadText && <p className="bookbar-lead">{leadText}</p>}
        <form className="bookbar-pill" onSubmit={onSubmit}>
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
      </div>
    </section>
  );
}
