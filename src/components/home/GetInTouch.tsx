"use client";

import { useState } from "react";
import { home } from "@/features/home/content";
import { Icon } from "./icons";
import { TextureCanvas } from "./TextureCanvas";

// "Get in touch" — the split soft-capture form. Design-only for now: submit
// validates natively then shows a success panel. No network call yet — the
// Supabase + Telegram capture backend is a separate follow-up; when wired,
// POST inside onSubmit before flipping to `done`.
export function GetInTouch() {
  const { getInTouch: g } = home;
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDone(true);
  }

  return (
    <section className="talk" id="talk" data-analytics-section="get-in-touch">
      <TextureCanvas
        tex="field"
        color="ink"
        dir="up"
        step={11}
        animate
        speed={2.8}
        className="talk-tex"
      />
      <div className="wrap">
        <div className="talk-grid">
          <div className="talk-copy">
            <div className="t-kicker eyebrow">{g.eyebrow}</div>
            <h2>
              <span className="em">{g.headingEm}</span>{" "}
              <span className="dim">{g.headingDim}</span>
            </h2>
            <p>{g.lead}</p>
            <ul className="talk-pts">
              {g.points.map((p, i) => (
                <li key={i}>
                  <Icon name="check" /> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="talk-slot">
            {done ? (
              <div className="form-done">
                <div className="fd-ic">
                  <Icon name="check" />
                </div>
                <h3>{g.success.heading}</h3>
                <p>{g.success.body}</p>
              </div>
            ) : (
              <form className="talk-form" onSubmit={onSubmit}>
                <div className="field">
                  <label htmlFor="git-name">{g.form.nameLabel}</label>
                  <input
                    id="git-name"
                    className="ev-input"
                    name="name"
                    placeholder={g.form.namePlaceholder}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="git-email">{g.form.emailLabel}</label>
                  <input
                    id="git-email"
                    type="email"
                    className="ev-input"
                    name="email"
                    placeholder={g.form.emailPlaceholder}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="git-area">{g.form.areaLabel}</label>
                  <select id="git-area" className="ev-select" name="area" defaultValue="">
                    <option value="" disabled>
                      {g.form.areaPlaceholder}
                    </option>
                    {g.form.areaOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-solid"
                  data-analytics-type="cta_button"
                  data-analytics-id={g.submitId}
                  data-analytics-label={g.form.submit}
                >
                  {g.form.submit} <Icon name="arrow-right" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
