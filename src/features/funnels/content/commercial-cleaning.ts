import type { FunnelContent } from "../types";

// Structure mirrors recruiting-agencies.ts (the refined template). Copy keeps
// the cleaning substance — facility/property managers, recurring contracts, the
// 5-calls-in-30-days guarantee — but follows recruiting's trimmed shape:
// eyebrows on every section, 3 benchmarks, a systemDiagram, a two-column
// pricing block, and the simple final CTA (no risk cards / comparison / keyInsight).
const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";

export const commercialCleaningContent: FunnelContent = {
  slug: "commercial-cleaning",
  displayName: "Commercial Cleaning",
  routePath: "for/commercial-cleaning",

  header: {
    logoText: "Evergreen Sys.",
    ctaButtonText: "Book Call",
    ctaUrl: CALENDLY,
    ctaId: "cc-header-book-call",
    navLinks: [
      { label: "Outcomes", href: "#expected-outcomes" },
      { label: "Why", href: "#why-outbound" },
      { label: "Deliverables", href: "#what-you-get" },
      { label: "Pricing", href: "#pricing" },
    ],
  },

  hero: {
    badgeText: "For Commercial Cleaning Companies That Want More Contracts",
    headline: "We Build & Run Outbound Systems That \n [[Book Qualified Sales Calls]]",
    subheadline:
      "An always-on outbound system that books contracts while you run the crews.",
    ctaButtonText: "Book a qualification call",
    ctaUrl: CALENDLY,
    ctaId: "cc-hero-book-call",
    bottomText: "Around 10 qualified sales calls in 90 days ((guaranteed!))",
    videoPlaceholderText: "Watch the overview",
  },

  outcomes: {
    eyebrow: "Outcomes",
    heading: "Get consistent, qualified sales calls",
    subheading:
      "Around 10 qualified sales calls within 90 days — the exact number projected for you on the call.",
    benefits: [
      "Without spending tens of thousands on ads",
      'Without paying bloated retainers for "leads" that go nowhere',
      "Without managing tools, inboxes, follow-ups, or infrastructure",
    ],
    valueProp:
      "We build and run the entire outbound system end-to-end.",
    valueSubtext:
      "You only show up to qualified calls booked directly on your calendar.",
    qualifierText:
      "**Only for owners or sales leaders at commercial cleaning companies in the US or Canada** with a clear offer and the capacity to take on new contracts. Not for experiments, short-term spikes, or \"growth hacks.\"",
  },

  benchmarks: {
    sectionId: "expected-outcomes",
    eyebrow: "The Numbers",
    heading: "What changes for you",
    benchmarks: [
      {
        title: "Qualified Sales Calls",
        value: "~10",
        description: "booked in 90 days, after a ~3-week warmup",
        subtext:
          "Anchored around 10 in 90 days; the exact number is projected for you from your service area and deal size. The first ~3 weeks is infrastructure warmup, then calls land during active sending.",
      },
      {
        title: "Your Hours on Sales",
        value: "0",
        description: "hours of your time per week after kickoff",
        subtext:
          "We handle sourcing, sending, replies, and booking. Your only job is showing up to the calls that land on your calendar.",
      },
      {
        title: "Your Pipeline",
        value: "Always-on",
        description: "runs in the background while you run the crews",
        subtext:
          "New decision-maker conversations keep landing month over month, because the engine doesn't depend on your time — even through your busiest stretches.",
      },
    ],
  },

  whyOutbound: {
    sectionId: "why-outbound",
    eyebrow: "Why Outbound",
    whyItWorks: {
      heading: "Why cold outreach works",
      introText:
        "Most cleaning companies grow through referrals and word of mouth. That works — until it plateaus, because you can't control when the next referral comes in. There are three ways to consistently win new contracts.",
      methods: ["Referrals", "Advertising", "Cold Outreach"],
      paragraphs: [
        "Most cleaning companies rely on the first two and hit a ceiling because of it.",
        "Cold outreach reaches the people who decide which cleaning company gets the contract — facility managers, property managers, office managers, and building owners — directly.",
      ],
      closingStatement:
        "At the **exact companies you want**, with the **exact buyer context you need**.",
    },
    traditionalFails: {
      heading: "Why traditional lead lists fail",
      introText: "Most lead generation for cleaning companies looks the same:",
      failurePoints: [
        "A list of emails with minimal context",
        "Generic personalization that buyers see through",
        "Low reply quality and endless back-and-forth",
        "Replies that pile up because no one works the inbox",
      ],
      keyMessage:
        "You don't need more names to cold call.\nYou need ((conversations with the right people at companies that need cleaning)).",
    },
    enrichment: {
      heading: 'What "enrichment" actually means',
      introText:
        "Every prospect is processed through an enrichment layer before any message goes out. We add real, usable context:",
      checks: [
        "Decision-maker verification and buying authority",
        "Building type, company size, and number of locations",
        "Service-area alignment to your operating radius",
        "Context that makes every email feel intentional, not automated",
      ],
      closingText:
        "Every email lands with **information**, not assumptions.",
    },
    sending: {
      heading: "How we protect your sender reputation",
      introText:
        "Great targeting means nothing if emails land in spam. The sending infrastructure is built to **protect your sender reputation** from day one:",
      items: [
        "Outreach goes from dedicated secondary domains, never your main domain",
        "Per-inbox volume capped so sending behavior stays natural",
        "21-28 day domain warmup before any cold send",
        "Every reply handled by us, no manual inbox triage on your side",
      ],
      infoBox: {
        title: "Why warmup matters",
        text: "Email providers don't trust new sending domains. Sending too much from a cold domain triggers spam filtering or burns the domain permanently — so reputation is built gradually before a single cold email goes out.",
      },
    },
  },

  systemDiagram: {
    sectionId: "the-system",
    eyebrow: "Inside the System",
    heading: "The machine we run for you",
    subheading:
      "Apollo sources decision-makers in your service area, the Evergreen Portal orchestrates, dedicated mailboxes send, replies route back. You touch none of it.",
    imageSrc: "/diagrams/email-infrastructure.png",
    imageAlt:
      "Diagram of the Evergreen sending system: Evergreen Portal at the top, dedicated sending domains with multiple inboxes each, flowing through Apollo Leads and Instantly down to Sales Calls and Paying Clients.",
  },

  whatYouGet: {
    sectionId: "what-you-get",
    eyebrow: "Deliverables",
    heading: "What you get ((done for you))",
    deliverables: [
      "A precise ICP and targeting blueprint — facility types, company sizes, and decision-makers matched to your services",
      "Dedicated sending domains, kept separate from yours so your reputation stays safe",
      "Verified decision-makers within your exact service area",
      "Email sequences written in your voice and personalized per prospect",
      "We answer every reply for you, in your voice, and qualify real interest",
      "Qualified calls booked straight to your calendar, with each prospect prepped",
      "Reminders and confirmations on every call to cut no-shows",
      "Live tracking of every lead and call, with ongoing optimization",
    ],
    bottomNegatives: [],
    closingStatement: "You just show up to calls with people who need cleaning services.",
  },

  timeline: {
    eyebrow: "How It Works",
    heading: "From kickoff to qualified calls",
    steps: [
      {
        step: "Step 1",
        title: "Alignment and Discovery",
        description:
          "We start by aligning on your offer, ICP, sender voice, and qualification criteria, so targeting and messaging are intentional from the beginning.",
      },
      {
        step: "Step 2",
        title: "Infrastructure Setup",
        description:
          "Dedicated secondary domains and sending inboxes are purchased, configured, and scaled to your target volume, with full domain authentication. Your main domain is never touched.",
      },
      {
        step: "Step 3",
        title: "Warmup Phase",
        description:
          "Inboxes go through a controlled 21-28 day warmup. Reputation is built gradually so cold sends land in the inbox, not spam.",
      },
      {
        step: "Step 4",
        title: "Prospect Sourcing and Enrichment",
        description:
          "While inboxes warm up, decision-makers at companies within your service area are sourced and enriched with real context — building type, size, and buying authority. One contact per company.",
      },
      {
        step: "Step 5",
        title: "Sequence Build and Reply Handling Setup",
        description:
          "A sequence is written in your voice for the cleaning niche, with per-prospect personalization at send time. Reply handling and booking flow configured.",
      },
      {
        step: "Step 6",
        title: "Launch and Optimization",
        description:
          "Cold sends go live. We handle every inbound end-to-end and book qualified sales calls directly to your calendar with a pre-call brief. Performance is reported, the system tuned on real data.",
      },
    ],
  },

  pricing: {
    sectionId: "pricing",
    layout: "two-column",
    sectionTitle: "Simple, transparent, performance-backed",
    price: {
      badgeText: "Founding Rate",
      setupAmount: "$1,500",
      setupLabel: "one-time setup",
      monthlyAmount: "$2,000",
      monthlyLabel: "per month",
      roiNote:
        "((One contract pays it back many times.)) A commercial cleaning contract runs $2,000-$5,000/month — $24K-$60K a year. A single close covers the engagement several times over, and contracts recur.",
    },
    pricingNote:
      "Founding-cohort rate for the first cleaning companies we work with — month-to-month, no long contract. Standard rate rises once the case studies are in. Exact scope confirmed on a quick call.",
    cta: {
      label: "Book a 15-minute call",
      url: CALENDLY,
    },
    guarantee: {
      badgeText: "Performance Guarantee",
      heading: "We remove the downside completely",
      steps: [
        {
          text: "A **one-time setup fee** builds your system and absorbs the warmup month.",
        },
        {
          text: "A **monthly fee** runs it once it goes live.",
        },
        {
          text: "**We project your number on the call, anchored around 10 qualified calls in 90 days. Miss it, and your setup fee and first month come back.** Sending infrastructure and tool costs are the only exclusions.",
          highlighted: true,
        },
      ],
      benefits: [
        "✓ No long-term contracts",
        "✓ No hidden conditions",
        "✓ No paying for activity instead of outcomes",
      ],
      closingStatement: "You pay for results, not promises.",
    },
  },

  faq: {
    heading: "Questions, answered.",
    faqs: [
      {
        question: "We get most of our work through referrals. Why do we need this?",
        answer:
          "Referrals are the best contracts you'll ever win. The problem is you can't control when the next one comes in, and they plateau. This isn't a replacement — it runs in parallel: you keep the referrals, we add a second channel that produces conversations every month whether you're networking or not.",
      },
      {
        question: "What if we only serve a specific geographic area?",
        answer:
          "That's exactly how the system is designed to work. We only target decision-makers within your service area. Whether you cover a single city, a metro region, or multiple locations, targeting is filtered by geography so you never waste outreach on prospects you can't serve.",
      },
      {
        question: "We've tried cold email before. What's different here?",
        answer:
          "Most cleaning companies that tried cold email stopped for one of two reasons: doing it themselves and quitting when operations got busy, or hiring a generalist agency with generic copy and broad lists. We run cleaning-only, signal-verified prospects — the right decision-makers at companies that match your services — and the system doesn't stop when you get busy. That's the structural difference.",
      },
      {
        question: "What size contracts does this typically generate?",
        answer:
          "Commercial cleaning contracts typically range from $500 to $2,400 per month depending on facility size and service scope. Even one closed deal can cover the cost of the engagement, and contracts are recurring — they compound month over month.",
      },
      {
        question: "How quickly will we start getting calls?",
        answer:
          "The system includes a setup and warmup phase that takes a few weeks to protect deliverability. Once outreach goes live, initial responses usually come within 5 to 10 days, and calls begin booking as conversations progress.",
      },
      {
        question: "Does this take time away from running the business?",
        answer:
          "Almost none. We handle sourcing, enrichment, sending, replies, and booking. Your job is showing up to the calls that land on your calendar, with a pre-call brief so you walk in already knowing the company and the angle. The whole point is to run acquisition in parallel with operations, not from inside them.",
      },
    ],
  },

  finalCta: {
    heading: "Book a 15-minute\ncall to see",
    headingAccent: "if it's a fit.",
    subheading:
      "No pitch, no pressure. Just an honest read on whether we can help.",
    ctaButtonText: "Book a 15-minute call",
    ctaUrl: CALENDLY,
    ctaId: "cc-final-book-call",
  },

  footer: {
    companyName: "Evergreen Systems",
  },
};
