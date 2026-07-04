"use client";

import { useState } from "react";
import { TextureCanvas } from "@/components/home/TextureCanvas";
import { Icon } from "@/components/home/icons";
import {
  visiblePosts,
  SHOW_DRAFTS,
  type InsightPost,
  type PostTexColor,
  type PostTexDir,
} from "@/features/insights/posts";

// Ported from the Claude Design v2 playbook index. Editorial card grid with
// topic filters, dot-texture thumbnails (static — no animation), and two CTA
// cards mixed in. Post content comes from the registry in
// src/features/insights/posts.ts — drafts render here only when SHOW_DRAFTS
// (local dev), with a DRAFT badge; production shows published posts only.

const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";
const AVATAR = "/home/mihai.png";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "strategy", label: "Strategy" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "targeting", label: "Targeting" },
  { id: "reply", label: "Reply handling" },
  { id: "automation", label: "Automation" },
] as const;

interface CtaCard {
  variant: "navy" | "acc";
  ck: string;
  title: string;
  body: string;
  href: string;
  color: PostTexColor;
  dir?: PostTexDir;
  step: number;
}

const CTA_CARDS: CtaCard[] = [
  {
    variant: "navy", ck: "Free · 30 minutes",
    title: "Get a teardown of your outbound",
    body: "An honest read on whether outbound fits, and exactly where your current setup leaks. No pitch.",
    href: CALENDLY, color: "on", dir: "center", step: 10,
  },
  {
    variant: "acc", ck: "Free tool · Live",
    title: "See what you're leaving on the table",
    body: "Run the numbers on the pipeline you're missing. Free, no email required.",
    href: "/roi-calculator", color: "on", dir: "up", step: 10,
  },
];

/** Interleave the two CTA cards after the 3rd and 6th post (or append). */
function buildGrid(posts: InsightPost[]): (InsightPost | CtaCard)[] {
  const grid: (InsightPost | CtaCard)[] = [...posts];
  grid.splice(Math.min(3, grid.length), 0, CTA_CARDS[0]);
  grid.splice(Math.min(7, grid.length), 0, CTA_CARDS[1]);
  return grid;
}

function isCta(item: InsightPost | CtaCard): item is CtaCard {
  return "variant" in item;
}

export function InsightsIndex() {
  const [filter, setFilter] = useState<string>("all");
  const posts = visiblePosts();
  const grid = buildGrid(posts);
  const shown = posts.filter((p) => filter === "all" || p.topic === filter).length;

  return (
    <>
      <section className="pb-head" data-analytics-section="insights-header">
        <div className="wrap">
          <h1>Insights</h1>
          <p className="pb-sub">Practical tactics for outbound that actually books calls.</p>

          <div className="pb-tools">
            <div className="filters">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`chip${filter === f.id ? " active" : ""}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="pb-count">
              <b>{shown}</b> articles
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }} data-analytics-section="insights-list">
        <div className="wrap">
          <div className="pgrid">
            {grid.map((item) => {
              if (isCta(item)) {
                const hide = filter !== "all";
                const internal = item.href.startsWith("/");
                return (
                  <a
                    key={`cta-${item.variant}`}
                    className={`pcard cta ${item.variant}${hide ? " hide" : ""}`}
                    href={item.href}
                    {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    data-analytics-type="cta_button"
                    data-analytics-id={`insights-cta-${item.variant}`}
                    data-analytics-label={item.title}
                  >
                    <TextureCanvas tex="field" color={item.color} dir={item.dir} step={item.step} />
                    <div className="cta-tx">
                      <div className="ck">{item.ck}</div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                    <span className="go">
                      <Icon name="arrow-right" />
                    </span>
                  </a>
                );
              }

              const hide = filter !== "all" && item.topic !== filter;
              const isDraft = SHOW_DRAFTS && !item.published;
              const body = (
                <>
                  <div className={`pcard-vis${item.vis ? ` ${item.vis}` : ""}`}>
                    <span className="vtag">{item.tag}</span>
                    <span className="vnum">{item.num}</span>
                    {isDraft && <span className="pcard-draft">Draft</span>}
                    <TextureCanvas tex={item.tex} color={item.color} dir={item.dir} step={item.step} />
                  </div>
                  <div className="pcard-body">
                    <div className="pcard-date">{item.date}</div>
                    <h3 className="pcard-title">{item.title}</h3>
                    <p className="pcard-ex">{item.ex}</p>
                    <div className="pcard-foot">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={AVATAR} alt="Mihai Pol" />
                      <span className="an">Mihai Pol</span>
                    </div>
                  </div>
                </>
              );

              // Cards without an article route yet render unclickable.
              if (!item.slug) {
                return (
                  <div key={item.num} className={`pcard is-static${hide ? " hide" : ""}`}>
                    {body}
                  </div>
                );
              }
              return (
                <a
                  key={item.num}
                  className={`pcard${hide ? " hide" : ""}`}
                  href={`/insights/${item.slug}`}
                  data-analytics-id={`insights-post-${item.num}`}
                >
                  {body}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
