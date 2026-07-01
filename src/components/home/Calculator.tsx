"use client";

import { useMemo, useState } from "react";
import { home } from "@/features/home/content";
import { CtaLink } from "./CtaLink";
import { Icon } from "./icons";

// Interactive, ungated calculator — a simplified version of the portal ROI
// model. We book qualified calls; the buyer closes them; here's what it's
// worth. Inputs are only what the buyer knows (calls we deliver · client
// value · their close rate). No outreach mechanics. Numbers live in
// content.ts (home.calculator) so they're tunable. Matches .eg-home.

function fmtUSD(n: number, digits = 0) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtNum(n: number, digits = 0) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function Calculator() {
  const { calculator: c } = home;
  const [calls, setCalls] = useState(c.inputs.calls.default);
  const [clientValue, setClientValue] = useState(c.inputs.clientValue.default);
  const [closeRate, setCloseRate] = useState(c.inputs.closeRate.default);

  const r = useMemo(() => {
    const clientsPerMonth = calls * (closeRate / 100);
    const revenuePerMonth = clientsPerMonth * clientValue;
    const revenuePerYear = revenuePerMonth * 12;
    return { clientsPerMonth, revenuePerMonth, revenuePerYear };
  }, [calls, clientValue, closeRate]);

  return (
    <section className="calc" id="calculator" data-analytics-section="calculator">
      <div className="wrap">
        <div className="shead">
          <div className="t-kicker eyebrow">{c.eyebrow}</div>
          <h2>
            <span className="em">{c.headingEm}</span>{" "}
            <span className="dim">{c.headingDim}</span>
          </h2>
          {c.lead && <p>{c.lead}</p>}
        </div>

        <div className="calc-card">
          {/* ── INPUTS ──────────────────────────────── */}
          <div className="calc-inputs">
            <div className="calc-field">
              <div className="calc-field-head">
                <label htmlFor="calc-calls">{c.inputs.calls.label}</label>
                <span className="calc-val">{calls}<span className="calc-val-u">/mo</span></span>
              </div>
              <input
                id="calc-calls"
                type="range"
                className="calc-range"
                min={c.inputs.calls.min}
                max={c.inputs.calls.max}
                step={c.inputs.calls.step}
                value={calls}
                onChange={(e) => setCalls(Number(e.target.value))}
              />
              {c.inputs.calls.presets && (
                <div className="calc-presets">
                  {c.inputs.calls.presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`calc-chip${calls === p ? " is-active" : ""}`}
                      onClick={() => setCalls(p)}
                    >
                      {p} calls
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="calc-field">
              <div className="calc-field-head">
                <label htmlFor="calc-value">{c.inputs.clientValue.label}</label>
                <span className="calc-val">{fmtUSD(clientValue)}</span>
              </div>
              <input
                id="calc-value"
                type="range"
                className="calc-range"
                min={c.inputs.clientValue.min}
                max={c.inputs.clientValue.max}
                step={c.inputs.clientValue.step}
                value={clientValue}
                onChange={(e) => setClientValue(Number(e.target.value))}
              />
            </div>

            <div className="calc-field">
              <div className="calc-field-head">
                <label htmlFor="calc-close">{c.inputs.closeRate.label}</label>
                <span className="calc-val">{closeRate}<span className="calc-val-u">%</span></span>
              </div>
              <input
                id="calc-close"
                type="range"
                className="calc-range"
                min={c.inputs.closeRate.min}
                max={c.inputs.closeRate.max}
                step={c.inputs.closeRate.step}
                value={closeRate}
                onChange={(e) => setCloseRate(Number(e.target.value))}
              />
            </div>

            <p className="calc-assume">{c.note}</p>
          </div>

          {/* ── RESULTS ─────────────────────────────── */}
          <div className="calc-results">
            <div className="calc-results-title t-kicker">{c.resultsTitle}</div>

            <div className="calc-stats">
              <div className="calc-stat">
                <span className="calc-stat-label">New clients</span>
                <span className="calc-stat-val">{fmtNum(r.clientsPerMonth, 1)}<span className="calc-stat-u">/mo</span></span>
              </div>
              <div className="calc-stat">
                <span className="calc-stat-label">New revenue</span>
                <span className="calc-stat-val">{fmtUSD(r.revenuePerYear)}<span className="calc-stat-u">/yr</span></span>
              </div>
            </div>

            <div className="calc-headline">
              <div className="calc-big">{fmtUSD(r.revenuePerMonth)}</div>
              <div className="calc-headline-label">{c.headlineLabel}</div>
            </div>

            <CtaLink
              href={c.cta.href}
              entityId={c.cta.id}
              label={c.cta.label}
              location="calculator"
              className="btn btn-solid calc-cta"
            >
              {c.cta.label} <Icon name="arrow-right" />
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
