import type { FunnelContent } from "../types";

export const outboundSystemContent: FunnelContent = {
  slug: "outbound-system",
  displayName: "Outbound Systems",

  header: {
    logoText: "Evergreen Sys.",
    ctaButtonText: "Book Call",
    ctaUrl: "https://calendly.com/hello-evergreensystems/evergreensystems",
    ctaId: "426f5869-48b5-4e36-bad3-203ea5425f9d",
    navLinks: [
      { label: "Outcomes", href: "#expected-outcomes" },
      { label: "Why", href: "#why-outbound" },
      { label: "Deliverables", href: "#what-you-get" },
      { label: "Pricing", href: "#pricing" },
    ],
  },

  hero: {
    badgeText: "For B2B Founders Who Need Predictable Clients",
    headline: "We Build & Run Outbound Systems That\n[[Books Qualified Sales Calls]]",
    subheadline:
      "An always-on outbound system that runs in the background while you focus on closing.",
    ctaButtonText: "Book a Qualification Call",
    ctaUrl: "https://calendly.com/hello-evergreensystems/evergreensystems",
    ctaId: "20960721-c403-4696-888e-3493de125658",
    bottomText: "10 booked calls a month ((guaranteed!))",
    videoPlaceholderText: "Watch the overview",
  },

  outcomes: {
    heading: "Get Consistent, Qualified Sales Calls",
    subheading:
      "At least 10 qualified sales calls within 30 days of the system going live",
    benefits: [
      "Without spending tens of thousands on ads",
      'Without paying bloated retainers for "leads" that go nowhere',
      "Without managing tools, inboxes, follow-ups, or infrastructure",
    ],
    valueProp:
      "We build and run the entire outbound system for you — end-to-end.",
    valueSubtext:
      "You only show up to qualified calls booked directly on your calendar.",
    qualifierText:
      "**ℹ️ Only continue if you're a B2B founder or decision-maker** with a clear offer and the ability to handle new sales conversations. This is not for experiments, short-term spikes, or \"growth hacks.\"\nThis is for founders who want a **repeatable, system-driven acquisition channel.**",
  },

  benchmarks: {
    sectionId: "expected-outcomes",
    heading: "Expected Outcomes",
    subheading: "What this system is designed to optimize for",
    benchmarks: [
      {
        title: "Reply Quality",
        value: "8–15%",
        description: "of replies are context-aware, human responses",
        subtext:
          "Replies that reference the message, company, or problem — not auto-responses or unsubscribes.",
      },
      {
        title: "Conversation to Call",
        value: "25–40%",
        description: "of qualified conversations book a call",
        subtext: "Measured after fit checks and intent validation.",
      },
      {
        title: "Call Show-Up Rate",
        value: "75–90%",
        description: "attendance on booked calls",
        subtext:
          "Driven by proper framing, confirmation, and reminder logic.",
      },
      {
        title: "Time to First Signal",
        value: "7–14 days",
        description: "after system goes live",
        subtext:
          "Initial replies and qualified conversations indicate correct targeting.",
      },
      {
        title: "Performance Improvement",
        value: "20–40%",
        description: "improvement in reply quality within 30–60 days",
        subtext:
          "As targeting, enrichment, and messaging compound.",
      },
      {
        title: "Deliverability Health",
        value: "<2%",
        description: "bounce rate · <0.1% spam complaints",
        subtext:
          "Maintained through domain isolation and controlled sending.",
      },
    ],
    bottomStatement:
      'This is not a "blast leads and pray" model. It is a system designed to create ((reliable sales conversations)), not vanity metrics.',
  },

  whyOutbound: {
    sectionId: "why-outbound",
    whyItWorks: {
      heading: "Why Cold Outreach Still Works (When Done Right)",
      introText: "There are three ways to acquire clients:",
      methods: ["Content Marketing", "Advertising", "Outbound Marketing"],
      paragraphs: [
        "Most companies rely on the first two — and pay heavily for it.",
        "You're only initiating conversations directly with **CEO's, Founders, Presidents, C-Suite, and Decision Makers.**",
      ],
      closingStatement:
        "At the **exact companies you want**, with the **exact buyer context you need**.",
    },
    traditionalFails: {
      heading:
        "Why Traditional Lead Lists Fail in Real Sales Conversations",
      introText: 'Most "lead gen" looks like this:',
      failurePoints: [
        "A list of emails",
        "Minimal context",
        "Generic personalization",
        "Low reply quality",
        "Endless back-and-forth before a real conversation",
      ],
      keyMessage:
        "You don't need more leads.\nYou need ((better-informed leads)).",
      oldWay: {
        label: "The Old Way",
        text: "Here are 5,000 emails. Good luck closing.",
      },
      newWay: {
        label: "The Evergreen Way",
        text: "Here are **enriched prospects**, with the exact data points needed to start real conversations.",
      },
      closingStatement:
        "This is the core difference.\n**Enriched leads = more qualified conversations.**",
    },
    enrichment: {
      heading: 'What "Enrichment" Actually Means',
      introText:
        "We do not just identify companies or collect email addresses. Every prospect is processed through an enrichment layer that adds **real, usable context** before any message is sent.",
      checks: [
        "Role relevance & buying authority",
        "Company signals & positioning",
        "Publicly available data that supports personalization",
        "Context that allows emails to sound intentional, not automated",
      ],
      closingText:
        "This ensures outreach is based on **information**, not assumptions.",
    },
    sending: {
      heading: "How Emails Are Sent Safely and at Scale",
      introText:
        "Enrichment alone is not enough if the sending setup is wrong. That is why the system is built with **controlled sending and inbox-safe infrastructure** from day one.",
      items: [
        "Outreach is sent from dedicated secondary domains, not your main domain",
        "Each domain uses a small number of inboxes to keep sending behavior natural",
        "Sending volume is intentionally limited per inbox to protect reputation",
        "Domains and inboxes are warmed properly before campaigns go live",
        "Campaigns are centrally managed so replies, follow-ups, and stops are handled correctly",
      ],
      infoBox: {
        title: "Why Warmup Matters",
        text: "Inbox warmup exists because email providers do not trust new sending domains immediately. Sending too much volume too quickly from a new domain is one of the fastest ways to trigger spam filtering or permanently damage sender reputation.",
      },
    },
    keyInsight: {
      badgeText: "Key Insight",
      heading: "Why This Matters",
      introText: "Most outbound fails for one of two reasons:",
      failureReasons: [
        "Messages lack context, so prospects ignore them",
        "Infrastructure is mismanaged, so messages never reach the inbox",
      ],
      closingStatement:
        "This system solves both. Enrichment improves reply quality. Controlled sending protects deliverability.",
    },
  },

  whatYouGet: {
    sectionId: "what-you-get",
    heading: "What You Get ((Done For You))",
    subheading:
      "A fully managed outbound system built, operated, and optimized on your behalf.",
    deliverables: [
      "ICP research and buyer definition aligned to your offer",
      "Lead sourcing for your exact target accounts",
      "AI driven lead filtering and enrichment before any outreach",
      "Purchase and setup of dedicated secondary domains",
      "Creation of sending inboxes under those domains",
      "Deliverability and authentication configuration for sending domains",
      "Inbox warmup, reputation protection and sending safeguards",
      "Connection to a centralized sending platform",
      "Campaign setup using a structured three step sequence",
      "Ongoing campaign execution and follow ups",
      "Reply handling and basic qualification",
      "Sales calls booked directly to your calendar",
      "Continuous optimization based on real reply data",
    ],
    bottomNegatives: [
      "✗ You do not manage tools",
      "✗ You do not chase leads",
      "✗ You do not babysit campaigns",
    ],
    closingStatement: "You show up to qualified conversations.",
  },

  comparison: {
    heading: "Why This Model Makes Sense",
    subheading:
      "If you want outbound to work as a real acquisition channel, there are only three paths.",
    cards: [
      {
        title: "Build it yourself",
        description:
          "You can learn outbound internally. This usually means weeks spent learning tools, deliverability basics, and workflows. Most teams underestimate how much data quality and infrastructure discipline matter until time and reputation are already lost.",
      },
      {
        title: "Hire a typical lead generation agency",
        description:
          "You can outsource outbound to an agency. In most cases, you pay for activity, not outcomes. Leads are delivered without meaningful context, and the system itself is not owned by you.",
      },
      {
        title: "Run a fully managed, enriched outbound system",
        description:
          "The system is built, operated, and improved for you. Data quality, enrichment, infrastructure, and execution live inside one system. **You focus on sales. The system handles acquisition.**",
        highlighted: true,
        badge: "The Evergreen Systems Model",
      },
    ],
  },

  timeline: {
    heading: "Timeline: How This Goes Live",
    subheading:
      "A structured rollout designed to protect deliverability, ensure data quality, and avoid rushed launches that break systems.",
    steps: [
      {
        step: "Step 1",
        title: "Alignment and Discovery",
        description:
          "We start by aligning on your offer, ideal customer profile, and sales goals. This step ensures targeting, messaging, and qualification criteria are intentional from the beginning.",
      },
      {
        step: "Step 2",
        title: "Infrastructure Setup",
        description:
          "Dedicated secondary domains and sending inboxes are purchased and configured. This step exists to protect your main domain and establish a clean foundation for outbound.",
      },
      {
        step: "Step 3",
        title: "Warmup Phase",
        description:
          "Inboxes go through a controlled warmup period that typically lasts around 21 days. During this phase, sending reputation is built gradually to avoid spam issues.",
      },
      {
        step: "Step 4",
        title: "ICP Definition and Enrichment Logic",
        description:
          "While inboxes warm up, we finalize ICP rules, sourcing logic, and enrichment criteria. Leads are filtered and enriched with relevant context before outreach.",
      },
      {
        step: "Step 5",
        title: "System Build and Launch Preparation",
        description:
          "Messaging is written, follow ups are structured into a three step sequence, reply handling is configured, and the booking flow is set up.",
      },
      {
        step: "Step 6",
        title: "Launch and Optimization",
        description:
          "Campaigns go live with enriched data and controlled sending. Replies are monitored, qualified conversations are booked, and performance is continuously refined.",
      },
    ],
    successBox: {
      badgeText: "Success Metrics",
      heading: "What Success Looks Like",
      text: "The system is live and producing qualified sales conversations on a consistent basis. We do not measure success by emails sent or activity levels. We measure it by **real conversations with decision-makers**.",
    },
  },

  pricing: {
    sectionId: "pricing",
    includedHeading: "What's Included",
    includedSubheading:
      "Everything you need for a fully managed outbound system",
    includes: [
      "ICP research and targeting",
      "Lead sourcing and AI driven enrichment",
      "Dedicated sending inboxes",
      "Deliverability focused sending infrastructure",
      "Campaign setup and execution",
      "Reply handling and qualification",
      "Calendar booking flow",
      "Ongoing optimization based on real reply data",
    ],
    pricingNote:
      "Because every outbound system is built differently, pricing is aligned after a short qualification call.\n((No generic packages. Only what fits your business.))",
    guarantee: {
      badgeText: "Performance Guarantee",
      heading: "We Remove the Downside Completely",
      steps: [
        {
          text: "You pay a **one-time setup fee** to build the system",
        },
        {
          text: "Once the system goes live, **monthly management begins**",
        },
        {
          text: "If the system does **not produce at least 10 qualified sales calls within 30 days** of going live: **both the setup fee and the first month's management fee are fully refunded**",
          highlighted: true,
        },
      ],
      benefits: [
        "✓ No long-term contracts",
        "✓ No hidden conditions",
        "✓ No paying for activity instead of outcomes",
      ],
      closingStatement: "You are paying for results, not promises.",
    },
  },

  faq: {
    heading: "Frequently Asked Questions",
    faqs: [
      {
        question: "What does Evergreen Systems actually handle?",
        answer:
          "Evergreen Systems builds, runs, and optimizes the entire outbound system end to end. This includes targeting, lead sourcing, AI driven enrichment, messaging, sending, follow ups, reply handling, and booking qualified sales calls to your calendar. Your role is focused on sales conversations, not outbound execution.",
      },
      {
        question: "How involved do I need to be?",
        answer:
          "Very little. We align upfront on your offer, ideal customer profile, and qualification criteria. Once the system is live, your main responsibility is showing up prepared for booked sales calls.",
      },
      {
        question: "How quickly does the system start working?",
        answer:
          "Every engagement begins with a setup and warmup phase designed to protect deliverability. This typically takes a few weeks. Once outreach goes live, replies and conversations begin accumulating as the system gathers real data.",
      },
      {
        question: "Is this a one time campaign or an ongoing system?",
        answer:
          "This is an ongoing outbound system, not a one off campaign. Performance improves over time as targeting, enrichment, and messaging are refined based on real reply data.",
      },
      {
        question: "What happens after a call is booked?",
        answer:
          "Once a qualified call is booked, the conversation is handed off to you. From that point forward, you handle the sales process, follow up, and closing inside your existing workflow or CRM. If needed, booked calls can be passed into your CRM so your pipeline stays organized, but sales execution remains fully on your side.",
      },
      {
        question: "Is this compliant with email regulations?",
        answer:
          "Outbound is set up using standard best practices, including proper identification and unsubscribe handling. You remain in control of your messaging and business information at all times.",
      },
    ],
  },

  finalCta: {
    heading: "Start Getting Qualified Calls",
    subheading:
      "Book a no-pressure strategy call to see if this system is the right fit for your business.",
    worstCase: {
      label: "WORST CASE",
      text: "You walk away with a clearer outbound strategy and a better understanding of what would actually work for your business.",
    },
    bestCase: {
      label: "BEST CASE",
      text: "You install a predictable, enriched acquisition system that books qualified sales conversations consistently.",
    },
    ctaButtonText: "Book a Strategy Call",
    ctaUrl: "https://calendly.com/hello-evergreensystems/evergreensystems",
    ctaId: "783ee798-5de9-4186-959c-67710862bd0e",
    subtext:
      "No pressure. No commitment.\nJust a clear conversation about whether this system fits your business.",
  },

  footer: {
    companyName: "Evergreen Systems",
  },
};
