"use client";

import { useState } from "react";
import Link from "next/link";
import { trackFormSubmit } from "@/lib/form-tracking";
import { Icon } from "@/components/home/icons";

// Contact form — design-only for now (validate on submit -> success panel, no
// network), mirroring the GetInTouch pattern. When the capture backend lands
// (shared Supabase + Telegram ping), POST inside onSubmit before setDone(true).
export function ContactForm() {
  const [done, setDone] = useState(false);
  const [firstName, setFirstName] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    trackFormSubmit("contact");
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <div className="ct-card">
        <div className="ct-done">
          <div className="tick">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3>Message sent.</h3>
          <p>
            Thanks{firstName ? `, ${firstName}` : ""}. We&apos;ve got it. Expect a straight reply
            within one business day.
          </p>
          <Link className="home" href="/">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ct-card">
      <h2 className="ct-card-h">Send us a message</h2>
      <p className="ct-card-sub">
        Fields marked <span style={{ color: "var(--accent)" }}>*</span> are required.
      </p>

      <form onSubmit={onSubmit} data-analytics-form="contact" noValidate>
        <div className="field row2">
          <div className="field">
            <label htmlFor="ct-first">
              First name <span className="req">*</span>
            </label>
            <input
              id="ct-first"
              className="ev-input"
              name="first"
              placeholder="Your first name"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ct-last">
              Last name <span className="req">*</span>
            </label>
            <input
              id="ct-last"
              className="ev-input"
              name="last"
              placeholder="Your last name"
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="ct-email">
            Work email <span className="req">*</span>
          </label>
          <input
            id="ct-email"
            type="email"
            className="ev-input"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="ct-website">Company website</label>
          <input
            id="ct-website"
            className="ev-input"
            name="website"
            placeholder="yourcompany.com"
          />
        </div>

        <div className="field">
          <label htmlFor="ct-topic">
            What are you working through? <span className="req">*</span>
          </label>
          <select id="ct-topic" className="ev-select" name="topic" defaultValue="" required>
            <option value="" disabled>
              Select an area
            </option>
            <option>Commercial cleaning</option>
            <option>Commercial HVAC</option>
            <option>Another industry</option>
            <option>Not sure yet</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="ct-message">
            Your message <span className="req">*</span>
          </label>
          <textarea
            id="ct-message"
            className="ev-input"
            name="message"
            placeholder="A couple of lines on where you are and what you're after."
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-solid ct-send"
          data-analytics-type="cta_button"
          data-analytics-id="contact-send"
          data-analytics-label="Send message"
        >
          Send message <Icon name="arrow-right" />
        </button>
        <p className="ct-fine">
          By sending this you agree we can email you back. No lists, no sequences, just a reply.
        </p>
      </form>
    </div>
  );
}
