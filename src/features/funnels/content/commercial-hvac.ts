import type { FunnelContent } from "../types";

// Structure mirrors recruiting-agencies.ts / commercial-cleaning.ts (the refined
// template). Copy is aligned to the real "Commercial HVAC" offer:
// 10 qualified sales calls in 90 days (post-warmup), full-retainer money-back
// guarantee, $2,000 setup + $2,000/mo founding. The buyer's customer is
// commercial buildings/portfolios; the decision-maker is the facilities /
// property manager or building owner. (Offer DB calls the unit a "walkthrough";
// the page says "calls" — plainer language, per Mihai.)
const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";

export const commercialHvacContent: FunnelContent = {
  slug: "commercial-hvac",
  displayName: "Commercial HVAC",
  routePath: "for/commercial-hvac",

  header: {
    logoText: "Evergreen Sys.",
    ctaButtonText: "Book Call",
    ctaUrl: CALENDLY,
    ctaId: "hvac-header-book-call",
    navLinks: [
      { label: "Outcomes", href: "#expected-outcomes" },
      { label: "Why", href: "#why-outbound" },
      { label: "Deliverables", href: "#what-you-get" },
      { label: "Pricing", href: "#pricing" },
    ],
  },

  hero: {
    badgeText: "For Commercial HVAC Contractors That Want More Service Contracts",
    headline: "We Build & Run Outbound Systems That \n [[Book Qualified Sales Calls]]",
    subheadline:
      "An always-on pipeline of booked calls while you keep the trucks running.",
    ctaButtonText: "Book a qualification call",
    ctaUrl: CALENDLY,
    ctaId: "hvac-hero-book-call",
    bottomText: "10 qualified sales calls in 90 days ((guaranteed!))",
    videoPlaceholderText: "Watch the overview",
  },

  outcomes: {
    eyebrow: "Outcomes",
    heading: "Get consistent, qualified sales calls",
    subheading:
      "At least 10 qualified sales calls within 90 days — with facilities and property decision-makers in your service area.",
    benefits: [
      "Without chasing GCs and waiting for them to throw you a bid",
      "Without depending on referrals that dry up between projects",
      "Without managing tools, inboxes, follow-ups, or infrastructure",
    ],
    valueProp:
      "We build and run the entire outbound system end-to-end.",
    valueSubtext:
      "You only show up to calls booked directly on your calendar.",
    qualifierText:
      "**Only for owners or sales leaders at commercial HVAC contractors in the US or Canada** with the crew capacity to take on new commercial accounts. Not for residential-only shops, experiments, or short-term spikes.",
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
          "Anchored around 10 in 90 days — each a real call with a verified facilities or property decision-maker at a building in your service area. The first ~3 weeks is infrastructure warmup, then calls land during active sending.",
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
          "New facilities and property-manager conversations keep landing month over month, because the engine doesn't depend on your time — even through your busiest stretches.",
      },
    ],
  },

  whyOutbound: {
    sectionId: "why-outbound",
    eyebrow: "Why Outbound",
    whyItWorks: {
      heading: "Why cold outreach works",
      introText:
        "Most commercial HVAC shops grow through referrals and word of mouth. That works — until it plateaus, because you can't control when the next one lands. There are three ways to consistently win commercial service accounts.",
      methods: ["Referrals", "Advertising", "Cold Outreach"],
      paragraphs: [
        "Most shops rely on the first two and hit a ceiling because of it.",
        "Cold outreach reaches the people who decide which contractor services the building — facilities managers, property managers, and building owners — directly.",
      ],
      closingStatement:
        "At the **exact buildings you want**, with the **exact buyer context you need**.",
    },
    traditionalFails: {
      heading: "Why traditional lead lists fail",
      introText: "Most lead generation for contractors looks the same:",
      failurePoints: [
        "A list of emails with minimal context",
        "Generic personalization that buyers see through",
        "No read on whether the building even has equipment you service",
        "Replies that pile up because no one works the inbox",
      ],
      keyMessage:
        "You don't need more names.\nYou need ((conversations with facilities and property managers who actually run the buildings)).",
    },
    enrichment: {
      heading: 'What "enrichment" actually means',
      introText:
        "Every prospect is processed through an enrichment layer before any message goes out. We add real, usable context:",
      checks: [
        "Decision-maker verification — facilities manager, property manager, or building owner",
        "Building type, size, and the kind of HVAC/refrigeration equipment on site",
        "Service-area alignment to your operating radius",
        "Buying signals — aging units, lease renewals, recent emergencies, new facilities",
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
      "Apollo sources facilities and property decision-makers in your service area, the Evergreen Portal orchestrates, dedicated mailboxes send, replies route back. You touch none of it.",
    imageSrc: "/diagrams/email-infrastructure.png",
    imageAlt:
      "Diagram of the Evergreen sending system: Evergreen Portal at the top, dedicated sending domains with multiple inboxes each, flowing through Apollo Leads and Instantly down to Booked Calls and Service Contracts.",
  },

  whatYouGet: {
    sectionId: "what-you-get",
    eyebrow: "Deliverables",
    heading: "What you get ((done for you))",
    deliverables: [
      "A precise ICP and targeting blueprint — building types, equipment, and decision-makers matched to what you service",
      "Dedicated sending domains, kept separate from yours so your reputation stays safe",
      "Verified facilities and property decision-makers within your exact service area",
      "Email sequences written in your voice and personalized per prospect",
      "We answer every reply for you, in your voice, and qualify real interest",
      "Qualified calls booked straight to your calendar, with each prospect prepped",
      "Reminders and confirmations on every call to cut no-shows",
      "Live tracking of every lead and call, with ongoing optimization",
    ],
    bottomNegatives: [],
    closingStatement: "You just show up to calls with buildings that need service.",
  },

  timeline: {
    eyebrow: "How It Works",
    heading: "From kickoff to qualified calls",
    steps: [
      {
        step: "Step 1",
        title: "Alignment and Discovery",
        description:
          "We start by aligning on your service area, the building types and equipment you service, sender voice, and qualification criteria, so targeting and messaging are intentional from the beginning.",
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
          "While inboxes warm up, facilities and property decision-makers at commercial buildings in your service area are sourced and enriched with real context — building type, equipment, and buying signals. One contact per building.",
      },
      {
        step: "Step 5",
        title: "Sequence Build and Reply Handling Setup",
        description:
          "A sequence is written in your voice for the commercial HVAC niche, with per-prospect personalization at send time. Reply handling and booking flow configured.",
      },
      {
        step: "Step 6",
        title: "Launch and Optimization",
        description:
          "Cold sends go live. We handle every inbound end-to-end and book qualified calls directly to your calendar with a pre-call brief. Performance is reported, the system tuned on real data.",
      },
    ],
  },

  pricing: {
    sectionId: "pricing",
    layout: "two-column",
    sectionTitle: "Simple, transparent, performance-backed",
    price: {
      badgeText: "Founding Rate",
      setupAmount: "$2,000",
      setupLabel: "one-time setup",
      monthlyAmount: "$2,000",
      monthlyLabel: "per month",
      roiNote:
        "((One PM account pays it back many times.)) A mid-size preventive-maintenance contract is worth $3,000-$12,000/year recurring — before the change-outs and emergency work it drags along. Multi-location operators and property-management portfolios stack many buildings under one relationship.",
    },
    pricingNote:
      "Founding-cohort rate for the first contractors we work with — 3-month minimum, month-to-month after. Standard rate rises once the case studies are in. Third-party tool costs (data, sending, domains) are carried at cost. Exact scope confirmed on a quick call.",
    cta: {
      label: "Book a 15-minute call",
      url: CALENDLY,
    },
    guarantee: {
      badgeText: "Performance Guarantee",
      heading: "We remove the downside completely",
      steps: [
        {
          text: "A **one-time setup fee** builds your system.",
        },
        {
          text: "A **monthly fee** runs it once it goes live.",
        },
        {
          text: "**10 qualified sales calls in 90 days, after a ~3-week warmup. Miss it, and every retainer dollar comes back.** Only third-party tool costs are excluded.",
          highlighted: true,
        },
      ],
      benefits: [
        "✓ Month-to-month after a 3-month minimum",
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
        question: "We get most of our work through GCs and referrals. Why do we need this?",
        answer:
          "GCs and referrals are great work when they come — but you don't control the timing, and they slow down exactly when you need them. This isn't a replacement; it runs in parallel: you keep the referral and GC work, we add a second channel that books calls with facilities and property managers every month, whether or not the phone is ringing.",
      },
      {
        question: "What if we only serve a specific geographic area?",
        answer:
          "That's exactly how the system is designed to work. We only target decision-makers at buildings within your service area. Whether you cover a single metro or several, targeting is filtered by geography so you never waste outreach on buildings you can't service.",
      },
      {
        question: "We've tried cold email before. What's different here?",
        answer:
          "Most contractors who tried cold email stopped for one of two reasons: doing it themselves and quitting when jobs got busy, or hiring a generalist agency with generic copy and broad lists. We run commercial-HVAC-only, signal-verified prospects — buildings that actually run equipment you service, with the right decision-maker — and the system doesn't stop when you get busy. That's the structural difference.",
      },
      {
        question: "What size accounts does this typically generate?",
        answer:
          "A mid-size commercial preventive-maintenance contract runs roughly $3,000-$12,000 per year recurring, at healthy margin — and the change-out and emergency work it drags along is often worth more. Multi-location restaurant, retail, and grocery brands, plus property-management portfolios, concentrate many buildings under one relationship, so a single account can open a lot of doors.",
      },
      {
        question: "How quickly will we start getting calls?",
        answer:
          "The system includes a setup and warmup phase that takes a few weeks to protect deliverability. Once outreach goes live, initial responses usually come within 5 to 10 days, and calls begin booking as conversations progress.",
      },
      {
        question: "Does this take time away from running jobs?",
        answer:
          "Almost none. We handle sourcing, enrichment, sending, replies, and booking. Your job is showing up to the calls that land on your calendar, with a pre-call brief so you walk in already knowing the building and the equipment. The whole point is to run acquisition in parallel with the field work, not from inside it.",
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
    ctaId: "hvac-final-book-call",
  },

  footer: {
    companyName: "Evergreen Systems",
  },
};
