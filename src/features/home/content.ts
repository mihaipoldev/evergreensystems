// ════════════════════════════════════════════════════════════════════
// EVERGREEN HOMEPAGE — all copy in one place.
// Read directly by the components in src/components/home/. No adapter.
// Source of truth for the visual layout: the Claude Design export at
// design/v1-2026-06-05/project/site/index.html.
// Edit copy here; structure/markup lives in the components.
// ════════════════════════════════════════════════════════════════════
import type { HomeContent } from "./types";

const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";
const LINKEDIN = "https://www.linkedin.com/in/mihai-pol/";
const CLEANING = "/for/commercial-cleaning";
const HVAC = "/for/commercial-hvac";

export const home: HomeContent = {
  nav: {
    brandLogo: "/home/logos/evergreen-horizontal-navy.svg",
    brandAlt: "Evergreen Systems",
    links: [
      { label: "What you get", href: "#outcomes" },
      { label: "How it works", href: "#system" },
      { label: "Guarantee", href: "#guarantee" },
      { label: "Who it's for", href: "#niches" },
    ],
    cta: { id: "nav-book-call", label: "Book a call", href: CALENDLY },
  },

  hero: {
    eyebrow: "Done-for-you outbound",
    titleEm: "Booked sales calls,",
    titleDim: "without the blast.",
    lead: "We build and run the outbound system — infrastructure, targeting, and reply handling — that puts qualified calls on your calendar. Done for you.",
    cta: { id: "hero-book-call", label: "Book a call", href: CALENDLY },
  },

  trust: [
    { icon: "shield-check", bold: "10 calls in 90 days", muted: "— or money back" },
    { icon: "server", bold: "Our own in-house system", muted: "— no reselling" },
    { icon: "user-round", prefix: "Built by ", link: { label: "Mihai Pol", href: LINKEDIN } },
    { icon: "zap", bold: "Founding clients", muted: "— limited spots" },
  ],

  platform: {
    eyebrow: "Built in-house",
    headingEm: "We built the machine,",
    headingDim: "you just take the calls.",
    lead: "Most agencies run your outreach out of a stock Instantly login and a spreadsheet. We built our own platform to source, enrich, write, send, and handle every reply in one place. You never log in — we operate it, you show up to booked calls.",
    points: [
      { bold: "Our own platform", rest: "— not a reseller seat on another tool" },
      { bold: "Built and operated in-house", rest: "— one owned system, nothing duct-taped" },
      { bold: "Completely managed", rest: "— nothing lands on your plate" },
    ],
    screenshots: [
      { src: "/home/platform-leads.png", alt: "Evergreen platform — leads view showing sourced and enriched prospects" },
      { src: "/home/platform-executions.png", alt: "Evergreen platform — executions log showing automated reply handling" },
    ],
  },

  outcomes: {
    eyebrow: "What changes for you",
    headingEm: "Booked calls,",
    headingDim: "zero of your time.",
    items: [
      {
        num: "10+",
        unit: "in 90 days",
        accent: true,
        title: "Qualified calls, booked",
        body: "Decision-maker calls land directly on your calendar. A floor is guaranteed; the exact number is set per niche.",
      },
      {
        num: "0",
        unit: "hrs / week",
        title: "Zero of your time",
        body: "The whole system runs without you. Your only job is showing up to the calls that land on your calendar.",
      },
      {
        num: "Always",
        unit: "-on",
        title: "Pipeline that doesn't stall",
        body: "Runs in parallel with your busiest weeks — because the engine doesn't depend on your hours.",
      },
    ],
  },

  system: {
    eyebrow: "Inside the system",
    headingEm: "What runs",
    headingDim: "while you close.",
    stages: [
      { k: "01 · Targeting", title: "Sourced & enriched", body: "Decision-makers at your target accounts, enriched with real context — not a scraped list." },
      { k: "02 · Infrastructure", title: "Sent, inbox-safe", body: "24 warmed mailboxes across 8 secondary domains. Your main domain never sends." },
      { k: "03 · Reply handling", title: "Worked by us", body: "Every inbound qualified and routed. No inbox triage on your side." },
      { k: "04 · Booked", title: "On your calendar", body: "Qualified calls land directly on your calendar from month two, each with a pre-call brief.", end: true },
    ],
    diagram: {
      src: "/home/email-infrastructure.avif",
      alt: "Evergreen email infrastructure: a portal fanning out to 8 domains, each with dedicated inboxes, feeding Apollo leads through Instantly into sales calls and paying clients.",
    },
    specs: [
      "Secondary domains",
      "Dedicated mailboxes",
      "**21–28** day warmup",
      "your main domain **never touched**",
    ],
  },

  guarantee: {
    eyebrow: "The guarantee",
    heading: "We remove the downside completely.",
    num: "90 days",
    sub: "to hit your qualified-call floor — or every dollar comes back.",
    steps: [
      { n: "01", text: "A **one-time setup fee** builds your system." },
      { n: "02", text: "A **monthly fee** runs it once it's live." },
      { n: "03", text: "Miss the call floor in 90 days and **every dollar comes back — setup and retainer both.** Tool costs excluded." },
    ],
    tags: ["No long-term contracts", "No hidden conditions", "Pay for results, not activity"],
  },

  niches: {
    eyebrow: "Who it's for",
    headingBefore: "Built around ",
    headingDim: "your",
    headingAfter: " niche.",
    lead: "Each industry gets its own targeting, messaging, and guarantee. Pick yours — or book a call and we'll tell you straight whether outbound fits.",
    items: [
      { label: "Commercial cleaning", meta: "10 qualified calls / 90 days · live", live: true, href: CLEANING },
      { label: "Commercial HVAC", meta: "10 qualified calls / 90 days · live", live: true, href: HVAC },
    ],
    foot: {
      text: "Don't see your niche? ",
      linkLabel: "Book a call",
      linkHref: CALENDLY,
      tail: " — we'll tell you honestly whether it's a fit.",
    },
  },

  faq: {
    eyebrow: "FAQ",
    headingEm: "Questions,",
    headingDim: "answered straight.",
    items: [
      {
        id: "faq-handle",
        q: "What do you handle, and what's actually on my plate?",
        a: "We build, run, and manage the entire outbound system from end to end: targeting, sourcing, writing, sending, follow-ups, reply handling, and ongoing optimization. At kickoff we align on your offer, your voice, and what a qualified call looks like. After that it runs hands-off. Your only job is showing up to the qualified calls that land on your calendar.",
      },
      {
        id: "faq-guarantee",
        q: "How does your guarantee work?",
        a: "You get a floor of 10 qualified calls in 90 days. A qualified call is a real decision-maker at a company that fits your profile who books and shows up. Miss that floor, and every dollar comes back: setup and retainer both. The only carve-out is third-party tool costs. You pay for booked conversations, not for activity.",
      },
      {
        id: "faq-differentiation",
        q: "How is this different from a lead-gen agency, a VA, or just buying the tools myself?",
        a: "Most agencies rent you hours or hand you a list and wish you luck, and tools still need someone to run them every day. We build and operate the whole machine on our own platform, and we only win when calls land on your calendar. You're buying an outcome, not a software seat you have to learn or a freelancer you have to manage.",
      },
      {
        id: "faq-timeline",
        q: "How quickly will I see calls?",
        a: "The first couple of weeks go to building and warming your sending infrastructure, usually two to three weeks, so messages land in the inbox instead of spam. After that the system goes live and conversations start coming in, with the guarantee measured across the full 90 days.",
      },
      {
        id: "faq-ongoing",
        q: "Is this a one-time campaign or an ongoing system?",
        a: "Ongoing. This is a system, not a one-off blast. It compounds: targeting and messaging get sharper on real data, and most clients keep it running to build a steady, predictable pipeline instead of relying on timing or referrals.",
      },
      {
        id: "faq-trust",
        q: "Why should I trust you when you're newer and don't have a wall of case studies?",
        a: "Two reasons. You work directly with me, the person who builds and runs your system, not an account manager you'll never reach. And the risk sits with us, not you: if we miss the floor, you pay nothing. We'd rather earn the case study than borrow someone else's.",
      },
      {
        id: "faq-fit",
        q: "Who is this a good fit for, and who isn't?",
        a: "It works best for B2B businesses with a clear offer and the capacity to take on new sales conversations. It's not a fit if you can't follow up on the calls, or if you're after an instant one-week spike instead of a channel that builds over time.",
      },
    ],
  },

  close: {
    pill: "Founding clients — limited spots",
    heading: "Worst case, a sharper strategy. Best case, a full calendar.",
    sub: "No pitch, no pressure — just an honest read on whether we can help.",
    founder: {
      name: "Mihai Pol — Founder",
      avatar: "/home/mihai.png",
      avatarAlt: "Mihai Pol, Founder of Evergreen Systems",
      linkedin: LINKEDIN,
      line: "You'll talk to me directly — the person who built and runs the system.",
    },
    cta: { id: "close-book-call", label: "Book a 15-minute call", href: CALENDLY },
  },

  footer: {
    brandLogo: "/home/logos/evergreen-horizontal-navy.svg",
    brandAlt: "Evergreen Systems",
    tag: "Done-for-you outbound systems for B2B. Booked calls, not blasts.",
    columns: [
      {
        title: "Explore",
        links: [
          { label: "What you get", href: "#outcomes" },
          { label: "How it works", href: "#system" },
          { label: "Guarantee", href: "#guarantee" },
        ],
      },
      {
        title: "Niches",
        links: [
          { label: "Commercial cleaning", href: CLEANING },
          { label: "Commercial HVAC", href: HVAC },
        ],
      },
      {
        title: "Connect",
        links: [
          { label: "LinkedIn", href: LINKEDIN, icon: "linkedin", external: true },
          { label: "hello@evergreensystems.ai", href: "mailto:hello@evergreensystems.ai", icon: "mail" },
          { label: "Book a call", href: CALENDLY, icon: "calendar", external: true },
          { label: "Privacy", href: "/privacy" },
        ],
      },
    ],
    copy: "© 2026 Evergreen Systems. All rights reserved.",
  },
};
