// ════════════════════════════════════════════════════════════════════
// EVERGREEN HOMEPAGE: all copy in one place.
// Read directly by the components in src/components/home/. No adapter.
// Source of truth for the visual layout: the Claude Design export at
// design/v1-2026-06-05/project/site/index.html.
// Edit copy here; structure/markup lives in the components.
// ════════════════════════════════════════════════════════════════════
import type { HomeContent } from "./types";
import { hasPublishedPosts, SHOW_DRAFTS } from "@/features/insights/posts";

// Insights is "live" once at least one post is published (or in dev, where
// drafts are visible). While not live, the nav item shows "Soon" and the
// footer link is omitted — the /insights routes 404 in production anyway.
const INSIGHTS_LIVE = hasPublishedPosts || SHOW_DRAFTS;

// Contact is dev-only until the capture backend exists (the form must never
// promise a reply it can't deliver). Its links are omitted rather than marked
// "Soon" — a business that "can't be contacted yet" reads wrong; email and
// LinkedIn stay in the footer either way. /contact 404s in production.
const CONTACT_LIVE = SHOW_DRAFTS;

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
      { label: "How it works", href: "#pillars" },
      { label: "Guarantee", href: "#guarantee" },
      { label: "Who it's for", href: "#niches" },
    ],
    resources: {
      label: "Resources",
      items: [
        // No "Soon" teasers in the menu — unfinished resources are omitted
        // entirely until they're real (Insights returns when a post is
        // published; Case studies & guides return when their pages exist).
        ...(INSIGHTS_LIVE
          ? [
              {
                id: "nav-insights",
                icon: "notebook-pen" as const,
                title: "Insights",
                desc: "Field notes on building outbound that compounds.",
                href: "/insights",
              },
            ]
          : []),
        {
          id: "nav-roi-calculator",
          icon: "calculator",
          title: "ROI Calculator",
          desc: "See the revenue you're leaving on the table.",
          href: "/roi-calculator",
        },
        {
          id: "nav-about",
          icon: "user",
          title: "About the founder",
          desc: "Why Mihai built Evergreen, and how he works.",
          href: "/about",
        },
        ...(CONTACT_LIVE
          ? [
              {
                id: "nav-contact",
                icon: "message-square" as const,
                title: "Contact",
                desc: "Reach a human: form, email, or a call.",
                href: "/contact",
              },
            ]
          : []),
      ],
      foot: {
        id: "nav-resources-cta",
        text: "Not sure where to start? ",
        linkLabel: "Book a call",
        href: CALENDLY,
      },
    },
    cta: { id: "nav-book-call", label: "Book a demo", href: CALENDLY },
  },

  hero: {
    eyebrow: "Done-for-you outbound",
    titleEm: "Booked sales calls,",
    titleDim: "without the blast.",
    lead: "We build and run the whole outbound system that puts qualified calls on your calendar: infrastructure, targeting, and reply handling. Done for you.",
    cta: { id: "hero-book-call", label: "Get your free Growth Plan", href: CALENDLY },
  },

  trust: [
    { icon: "shield-check", bold: "10 calls in 90 days,", muted: "or money back" },
    { icon: "server", bold: "Our own in-house system,", muted: "no reselling" },
    { icon: "user-round", prefix: "Built by ", link: { label: "Mihai Pol", href: LINKEDIN } },
    { icon: "zap", bold: "Founding clients,", muted: "limited spots" },
  ],

  platform: {
    eyebrow: "Built in-house",
    headingEm: "We built the machine,",
    headingDim: "you just take the calls.",
    lead: "Most agencies run your outreach out of a stock Instantly login and a spreadsheet. We built our own platform to source, enrich, write, send, and handle every reply in one place. You never log in. We operate it, you show up to booked calls.",
    points: [
      { bold: "Our own platform,", rest: "running the best tools" },
      { bold: "Built and run in-house,", rest: "one owned system" },
      { bold: "Completely managed,", rest: "nothing on your plate" },
    ],
    screenshots: [
      { src: "/home/platform-leads.png", alt: "Evergreen platform, leads view showing sourced and enriched prospects" },
      { src: "/home/platform-executions.png", alt: "Evergreen platform, executions log showing automated reply handling" },
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
        body: "Runs in parallel with your busiest weeks, because the engine doesn't depend on your hours.",
      },
    ],
  },

  calculator: {
    eyebrow: "See your numbers",
    headingEm: "What you're leaving",
    headingDim: "on the table.",
    lead: "We book the calls, you close them. Here's what that's worth.",
    inputs: {
      calls: {
        label: "Qualified calls a month",
        min: 4,
        max: 30,
        step: 1,
        default: 10,
        presets: [5, 10, 15, 20],
      },
      clientValue: {
        label: "What a new client is worth",
        min: 1000,
        max: 100000,
        step: 500,
        default: 15000,
      },
      closeRate: {
        label: "Your close rate",
        min: 5,
        max: 60,
        step: 1,
        default: 25,
      },
    },
    resultsTitle: "Your new business, every month",
    headlineLabel: "in new revenue every month you're not getting today",
    note: "We guarantee a floor of 10 qualified calls in your first 90 days, or every dollar back.",
    cta: {
      id: "calc-growth-plan",
      label: "Get your free Growth Plan",
      href: CALENDLY,
    },
  },

  vsl: {
    eyebrow: "Watch, the 3-minute breakdown",
    headingEm: "See the system",
    headingDim: "before you book a call.",
    caption:
      "No pitch, just the actual infrastructure, targeting, and reply handling, walked through end to end.",
  },

  pillars: {
    eyebrow: "The system, in four moves",
    headingEm: "Four pillars",
    headingDim: "between a cold list and a booked call.",
    items: [
      {
        k: "01",
        label: "Infrastructure",
        title: "Authenticated domains, warmed before they ever send.",
        body: "The reputation layer nobody sees and everybody skips. We build it first, on separate domains, so your outreach lands in the inbox instead of spam.",
        points: [
          "Dedicated mailboxes on secondary domains, scaled to your target",
          "A 2 to 3 week warmup before the first real send",
          "SPF, DKIM and DMARC authenticated per domain",
          "Your main domain never sends, so its reputation stays clean",
        ],
      },
      {
        k: "02",
        label: "Targeting",
        title: "A list built around your real buyer, not scraped.",
        body: "We describe your ideal customer in plain terms, then build, verify, and segment the list around the people who can actually say yes.",
        points: [
          "Decision-makers at your ICP, enriched with real context",
          "Every address checked for deliverability",
          "Segmented by intent and buying signals",
          "Personalization that reads human, not merge-tag theater",
        ],
      },
      {
        k: "03",
        label: "Reply handling",
        title: "Every reply worked, humans where it counts.",
        body: "Replies are a workflow, not an inbox someone forgot about. We read, qualify, and route every one, and handle objections in your voice.",
        points: [
          "Every inbound read and qualified",
          "Positive replies routed straight to your calendar",
          "Objections handled in your voice",
          "Zero inbox triage on your side",
        ],
      },
      {
        k: "04",
        label: "Automation",
        title: "Calendar and CRM wired so booked means booked.",
        body: "The last mile most systems drop. A qualified reply becomes a confirmed call on your calendar, synced to your CRM, with a brief so you walk in ready.",
        points: [
          "Qualified calls land directly on your calendar",
          "A pre-call brief on every meeting",
          "Synced to your CRM automatically",
          "Reminders so they actually show up",
        ],
      },
    ],
  },

  guarantee: {
    eyebrow: "The guarantee",
    heading: "We remove the downside completely.",
    num: "90 days",
    sub: "to hit your qualified-call floor, or every dollar comes back.",
    steps: [
      { n: "01", text: "A **one-time setup fee** builds your system." },
      { n: "02", text: "A **monthly fee** runs it once it's live." },
      { n: "03", text: "Miss the call floor in 90 days and **every dollar comes back, setup and retainer both.** Tool costs excluded." },
    ],
    tags: ["No long-term contracts", "No hidden conditions", "Pay for results, not activity"],
  },

  pricing: {
    eyebrow: "Pricing",
    headingEm: "Booked calls,",
    headingDim: "priced to pay for itself.",
    sub: "Two ways to work with us. Pick the one that fits.",
    plans: [
      {
        kicker: "Model 01 · Performance",
        name: "Pay Per Qualified Lead",
        descriptor: "Only pay for the qualified calls we actually book.",
        tag: "Most flexible",
        featured: true,
        note: "Plus a small one-time setup fee to get started.",
        omitFeatures: ["90-day qualified-call guarantee"],
        cta: { id: "price-ppl", label: "Get a Quote", href: CALENDLY },
      },
      {
        kicker: "Model 02 · Predictable",
        name: "Flat Monthly Retainer",
        descriptor: "One predictable monthly fee, however many we book.",
        cta: { id: "price-retainer", label: "Get a Quote", href: CALENDLY },
      },
    ],
    features: [
      // What you get (top — it's about him)
      "Qualified calls on your calendar",
      "Fully done-for-you",
      "90-day qualified-call guarantee",
      "Pre-call brief on every meeting",
      "Every reply handled for you",
      "Your main domain stays protected",
      "Cold email in your voice",
      "Offer & positioning dialed in",
      "Calls synced to your CRM",
      "Direct access to the founder",
      "Ongoing optimization on real data",
      "Month-to-month, no contracts",
      // How we do it (bottom — what we use)
      "Decision-makers sourced & enriched",
      "Intent & buying-signal targeting",
      "AI-personalized at scale",
      "Continuously A/B tested",
      "Deliverability fully managed",
      "Infrastructure scaled to your target",
      "Our own in-house platform",
      "Powered by top-tier tools",
    ],
  },

  getInTouch: {
    eyebrow: "Get in touch",
    headingEm: "Not sure outbound fits?",
    headingDim: "Let's find out, honestly.",
    lead: "Tell us what you're working through. You'll get a straight read on whether a system makes sense, even if the answer is no.",
    points: [
      "No commitment, no pressure",
      "A response within one business day",
      "Actionable advice, even if we don't work together",
    ],
    form: {
      nameLabel: "Full name",
      namePlaceholder: "Your name",
      emailLabel: "Work email",
      emailPlaceholder: "you@company.com",
      areaLabel: "What are you working through?",
      areaPlaceholder: "Select an area",
      areaOptions: [
        "Commercial cleaning",
        "Commercial HVAC",
        "Another industry",
        "Not sure yet",
      ],
      submit: "Start the conversation",
    },
    submitId: "getintouch-submit",
    success: {
      heading: "Got it. We'll be in touch.",
      body: "Expect a straight read within one business day.",
    },
  },

  bookBar: {
    lead: "Like what the numbers say? Get your free Growth Plan and we'll show you how to book calls like these.",
    placeholder: "Enter your work email",
    buttonLabel: "Get my Growth Plan",
    buttonId: "bookbar-growth-plan",
    href: CALENDLY,
  },

  exitIntent: {
    guaranteeKicker: "The guarantee",
    guaranteeNumLines: ["10 calls", "in 90 days"],
    guaranteeSub: "or every dollar comes back. Setup and retainer both.",
    guaranteeTags: [
      { icon: "shield-check", label: "Pay for results, not activity" },
      { icon: "server", label: "Our own in-house system" },
      { icon: "zap", label: "Founding clients, limited spots" },
    ],
    eyebrow: "Before you go",
    heading: "Worst case, a sharper strategy.",
    body: "Leave your work email and we'll send the honest read on whether outbound fits. No pitch, no pressure.",
    emailPlaceholder: "you@company.com",
    submit: "Send me the honest read",
    submitId: "exit-honest-read",
    footPrefix: "Prefer to talk? ",
    footLinkLabel: "Get your free Growth Plan",
    footHref: CALENDLY,
    dismissLabel: "No thanks, I'll risk the silent inbox.",
    success: "On its way. We'll email the honest read shortly.",
  },

  niches: {
    eyebrow: "Who it's for",
    headingBefore: "Built around ",
    headingDim: "your",
    headingAfter: " niche.",
    lead: "Each industry gets its own targeting, messaging, and guarantee. Pick yours, or book a call and we'll tell you straight whether outbound fits.",
    items: [
      { label: "Commercial cleaning", meta: "10 qualified calls / 90 days · live", live: true, href: CLEANING },
      { label: "Commercial HVAC", meta: "10 qualified calls / 90 days · live", live: true, href: HVAC },
    ],
    foot: {
      text: "Don't see your niche? ",
      linkLabel: "Get your free Growth Plan",
      linkHref: CALENDLY,
      tail: ". We'll tell you honestly whether it's a fit.",
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
    pill: "Founding clients, limited spots",
    heading: "Worst case, a sharper strategy. Best case, a full calendar.",
    sub: "No pitch, no pressure, just an honest read on whether we can help.",
    founder: {
      name: "Mihai Pol, Founder",
      avatar: "/home/mihai.png",
      avatarAlt: "Mihai Pol, Founder of Evergreen Systems",
      linkedin: LINKEDIN,
      line: "You'll talk to me directly, the person who built and runs the system.",
    },
    cta: { id: "close-book-call", label: "Get your free Growth Plan", href: CALENDLY },
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
          { label: "How it works", href: "#pillars" },
          { label: "Guarantee", href: "#guarantee" },
          { label: "About the founder", href: "/about" },
        ],
      },
      {
        title: "Resources",
        links: [
          ...(INSIGHTS_LIVE ? [{ label: "Insights", href: "/insights" }] : []),
          { label: "ROI Calculator", href: "/roi-calculator" },
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
          ...(CONTACT_LIVE
            ? [{ label: "Contact", href: "/contact", icon: "message-square" as const }]
            : []),
          { label: "Get your free Growth Plan", href: CALENDLY, icon: "calendar", external: true },
          { label: "Privacy", href: "/privacy" },
        ],
      },
    ],
    copy: "© 2026 Evergreen Systems. All rights reserved.",
  },
};
