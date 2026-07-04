// ════════════════════════════════════════════════════════════════════
// INSIGHTS POSTS — the single registry for every blog card/article.
//
// `published` is the publish switch:
//   • drafts (published: false) render ONLY where drafts are visible
//     (local dev, or NEXT_PUBLIC_SHOW_DRAFTS=1) and carry a DRAFT badge;
//   • production shows published posts only;
//   • while ZERO posts are published, the whole Insights surface hides
//     itself in production: /insights and article routes 404, the nav
//     popover shows "Soon", and the footer link disappears.
// Publishing the first real article = set published: true here. Nothing
// else to flip.
//
// `slug` is the article route under /insights — omit it while the card
// is only an idea (the card renders unclickable).
// ════════════════════════════════════════════════════════════════════

import { SHOW_DRAFTS } from "@/lib/drafts";

export type PostTexColor = "ink" | "accent" | "on" | "white";
export type PostTexDir = "down" | "up" | "left" | "right" | "center";

export interface InsightPost {
  /** Article route under /insights; omit while no article page exists. */
  slug?: string;
  /** The publish switch. false = draft (dev-only, DRAFT badge). */
  published: boolean;
  topic: "strategy" | "infrastructure" | "targeting" | "reply" | "automation";
  num: string;
  tag: string;
  date: string;
  title: string;
  ex: string;
  vis: "" | "ink" | "tint";
  tex: "terrain" | "field";
  color: PostTexColor;
  dir?: PostTexDir;
  step: number;
}

/** Whether draft content renders (local dev, or forced via env for previews). */
export { SHOW_DRAFTS };

export const POSTS: InsightPost[] = [
  {
    slug: "volume-isnt-the-system",
    published: false,
    topic: "strategy", num: "01", tag: "Strategy", date: "May 28 2026",
    title: "Volume Isn't the System. The System Is the System.",
    ex: "The blast is activity, not output. We break down why mass-sending trains spam filters against you, and what the four-part system that actually books calls looks like end to end.",
    vis: "ink", tex: "terrain", color: "accent", step: 7,
  },
  {
    published: false,
    topic: "infrastructure", num: "02", tag: "Infrastructure", date: "May 19 2026",
    title: "Deliverability Is Engineering, Not Luck",
    ex: "SPF, DKIM, DMARC, secondary domains, a 21-day warmup, and under 30 sends a day per inbox. The unglamorous foundation that decides whether anything else you do matters.",
    vis: "tint", tex: "field", color: "ink", dir: "up", step: 9,
  },
  {
    published: false,
    topic: "infrastructure", num: "03", tag: "Infrastructure", date: "May 12 2026",
    title: "Your Domains Are an Asset. Stop Burning Them.",
    ex: "Your main domain should never send a cold email. Here's the secondary-domain architecture that protects your reputation while the system sends at scale underneath it.",
    vis: "", tex: "terrain", color: "ink", step: 7,
  },
  {
    published: false,
    topic: "targeting", num: "04", tag: "Targeting", date: "May 5 2026",
    title: "A List Is a Starting Point, Not an Outcome",
    ex: "We don't sell you names. The difference between a scraped list and a targeted one is the difference between a silent inbox and a booked week. Where real targeting starts.",
    vis: "ink", tex: "field", color: "on", dir: "center", step: 9,
  },
  {
    published: false,
    topic: "targeting", num: "05", tag: "Targeting", date: "Apr 28 2026",
    title: "Real Personalization Runs on Data, Not Merge Tags",
    ex: "\"Hi {{FirstName}}\" is mail merge, not personalization. A job posting, a funding round, a tech-stack gap: the signals that prove you actually understand the prospect's situation.",
    vis: "tint", tex: "terrain", color: "ink", step: 8,
  },
  {
    published: false,
    topic: "reply", num: "06", tag: "Reply handling", date: "Apr 21 2026",
    title: "The Reply Is the Job. Most Teams Skip It.",
    ex: "Sending is the easy 20%. Qualifying and routing every inbound, daily, is the 80% that turns interest into a calendar invite, and the part automation-only setups quietly drop.",
    vis: "", tex: "field", color: "accent", dir: "center", step: 9,
  },
  {
    published: false,
    topic: "strategy", num: "07", tag: "Strategy", date: "Apr 14 2026",
    title: "Booked, Not Sent: The Only Metric That Counts",
    ex: "Opens, sends, activity: all vanity. The dashboard that matters has one number on it, qualified calls on the calendar. How to instrument outbound around the outcome, not the effort.",
    vis: "ink", tex: "terrain", color: "accent", step: 7,
  },
  {
    published: false,
    topic: "automation", num: "08", tag: "Automation", date: "Apr 7 2026",
    title: "Zero New Tools. One Full Calendar.",
    ex: "A done-for-you system is the opposite of a software purchase. Calendar and CRM wired so a booked call is actually booked, and nothing new lands on your team's plate.",
    vis: "tint", tex: "field", color: "ink", dir: "up", step: 9,
  },
  {
    published: false,
    topic: "strategy", num: "09", tag: "Strategy", date: "Mar 31 2026",
    title: "From a Silent Inbox to a Booked Week in 14 Days",
    ex: "What the first two weeks of a go-live actually look like: warmup finishing, first sends landing, first replies worked, and the first qualified call hitting the calendar.",
    vis: "", tex: "terrain", color: "ink", step: 8,
  },
];

/** True once at least one post is published — the "Insights is live" switch. */
export const hasPublishedPosts = POSTS.some((p) => p.published);

/** The posts to render in the current environment. */
export function visiblePosts(): InsightPost[] {
  return SHOW_DRAFTS ? POSTS : POSTS.filter((p) => p.published);
}

/** A post by its article slug (for gating article routes). */
export function postBySlug(slug: string): InsightPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
