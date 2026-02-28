import type { FunnelContent } from "../types";

export const commercialCleaningContent: FunnelContent = {
  slug: "commercial-cleaning",
  displayName: "Commercial Cleaning",
  routePath: "for/commercial-cleaning",

  header: {
    logoText: "Evergreen Sys.",
    ctaButtonText: "Book Call",
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
      "An always-on outbound system that runs in the background while you focus on closing.",
    ctaButtonText: "Book a Qualification Call",
    bottomText: "8+ qualified calls per month ((guaranteed!))",
    videoPlaceholderText: "Watch the overview",
  },

  outcomes: {
    heading: "Get Consistent, Qualified Sales Calls",
    subheading:
      "At least 8 qualified sales calls within 30 days of the first email sent",
    benefits: [
      "Without spending tens of thousands on ads",
      'Without paying bloated retainers for "leads" that go nowhere',
      "Without managing tools, inboxes, follow-ups, or infrastructure",
    ],
    valueProp:
      "We build and run the entire outbound system for you — end-to-end.",
    valueSubtext:
      "You only show up to qualified calls booked directly on your calendar.",
    qualifiedDefinition:
      "A qualified call is a booked conversation with a decision-maker — facility manager, property manager, office manager, or business owner — at a company within your service area that has a potential need for commercial cleaning services.",
    qualifierText:
      "**ℹ️ Only continue if you're a commercial cleaning company owner or sales leader** with a clear offer and the ability to handle new contract opportunities. This is not for experiments, short-term spikes, or \"growth hacks.\"\nThis is for cleaning company owners who want a **repeatable system that brings new cleaning contracts every month.**",
  },

  benchmarks: {
    sectionId: "expected-outcomes",
    heading: "Expected Outcomes",
    subheading: "Realistic performance benchmarks for enriched outreach to decision-makers in your service area",
    benchmarks: [
      {
        title: "Positive Reply Rate",
        value: "1–4%",
        description: "of contacted decision-makers respond with genuine interest",
        subtext:
          "These are real responses from decision-makers — not auto-replies, bounces, or unsubscribes.",
      },
      {
        title: "Conversation to Call",
        value: "30–50%",
        description: "of positive responses convert to a booked call",
        subtext: "Once someone expresses interest, our follow-up process books them directly on your calendar.",
      },
      {
        title: "Call Show-Up Rate",
        value: "75–85%",
        description: "of booked calls actually happen",
        subtext:
          "Driven by proper confirmation sequences and pre-qualified interest.",
      },
      {
        title: "Time to First Responses",
        value: "5–10 days",
        description: "after the first emails are sent",
        subtext:
          "You will know quickly whether targeting and messaging are hitting the right people.",
      },
      {
        title: "New Contracts",
        value: "2–3/mo",
        description: "new cleaning contracts per month at typical close rates",
        subtext:
          "8+ qualified calls, 20–30% close rate. Each contract worth $500–$2,400/month recurring. Revenue compounds — every month the system runs, new contracts stack on top of existing ones.",
      },
      {
        title: "Deliverability Health",
        value: "<2%",
        description: "bounce rate · <0.1% spam complaints",
        subtext:
          "Maintained through domain isolation, controlled sending volume, and proper warmup.",
      },
    ],
    bottomStatement:
      "These are not inflated projections. They are realistic benchmarks based on enriched, targeted outreach to ((verified decision-makers)) in your service area.",
  },

  whyOutbound: {
    sectionId: "why-outbound",
    whyItWorks: {
      heading: "Why Cold Outreach Still Works (When Done Right)",
      introText: "Most cleaning companies grow through referrals and word of mouth. That works — until it plateaus. You cannot control when the next referral comes in. There are three ways to consistently win new contracts:",
      methods: ["Content Marketing", "Advertising", "Outbound"],
      paragraphs: [
        "Most cleaning companies rely on the first two — and hit a ceiling because of it.",
        "You are reaching out directly to the people who decide which cleaning company gets the contract — **facility managers, property managers, office managers, and building owners.**",
      ],
      closingStatement:
        "At the **exact companies you want**, with the **exact buyer context you need**.",
    },
    traditionalFails: {
      heading:
        "Why Traditional Lead Lists Fail in Real Sales Conversations",
      introText: "Most lead generation for cleaning companies looks like this:",
      failurePoints: [
        "A list of emails",
        "Minimal context",
        "Generic personalization",
        "Low reply quality",
        "Endless back-and-forth before a real conversation",
      ],
      keyMessage:
        "You do not need more names to cold call.\nYou need ((conversations with the right people)).",
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
        "Decision-maker verification & buying authority",
        "Building type, company size & number of locations",
        "Service area alignment to your operating radius",
        "Context that makes every email feel intentional, not automated",
      ],
      closingText:
        "This ensures outreach is based on **information**, not assumptions.",
    },
    sending: {
      heading: "How Emails Are Sent Safely and at Scale",
      introText:
        "Great targeting means nothing if your emails land in spam. The entire sending infrastructure is built to **protect deliverability** from day one.",
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
      heading: "The Bottom Line",
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
      "ICP research — facility types, company sizes, and decision-makers matched to your services",
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
    closingStatement: "You show up to calls with people who need cleaning services.",
  },

  comparison: {
    heading: "Why This Model Makes Sense",
    subheading:
      "If you want a consistent flow of new cleaning contracts, there are only three paths.",
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
      "A structured rollout designed to protect deliverability and ensure every email reaches the right decision-makers.",
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
          "While inboxes warm up, we finalize targeting rules — which facility types, company sizes, and geographies match your services. Leads are filtered and enriched with real context before any outreach begins.",
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
      "ICP research — facility types, company sizes, and decision-makers matched to your services",
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
          text: "If the system does **not produce at least 8 qualified sales calls within 30 days** of the first email sent: **both the setup fee and the first month's management fee are fully refunded**",
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
        question: "What types of facilities do you target?",
        answer:
          "We target the specific facility types that match your cleaning services — office buildings, medical facilities, retail spaces, warehouses, multi-tenant properties, and more. During the discovery phase, we align on exactly which building types, company sizes, and geographies fit your business so every outreach is relevant.",
      },
      {
        question: "What if I only serve a specific geographic area?",
        answer:
          "That is exactly how the system is designed to work. We only target decision-makers within your service area. Whether you cover a single city, a metro region, or multiple locations, targeting is filtered by geography so you never waste outreach on prospects you cannot serve.",
      },
      {
        question: "How quickly will I start getting calls?",
        answer:
          "The system includes a setup and warmup phase that typically takes a few weeks to protect deliverability. Once outreach goes live, initial responses usually come within 5 to 10 days. From there, calls begin booking as conversations progress.",
      },
      {
        question: "What size cleaning contracts does this typically generate?",
        answer:
          "Commercial cleaning contracts typically range from $500 to $2,400 per month depending on facility size and service scope. Even one closed deal from this system can cover the cost of the engagement, and contracts are recurring — they compound month over month.",
      },
      {
        question: "How is this different from buying a lead list?",
        answer:
          "A lead list gives you names with no context. This system enriches every prospect with real information — their role, building type, company size, and service area alignment — before any email is sent. The result is outreach that feels intentional, not like a mass blast, which is why it generates real conversations instead of being ignored.",
      },
      {
        question: "Do I need to do anything once the system is running?",
        answer:
          "Very little. We handle targeting, enrichment, sending, follow-ups, and reply handling. Your main responsibility is showing up prepared for the calls booked on your calendar. You focus on closing — we handle everything that comes before.",
      },
    ],
  },

  finalCta: {
    heading: "Start Getting Qualified Sales Calls",
    subheading:
      "Book a quick call to see if this system fits your cleaning business.",
    worstCase: {
      label: "WORST CASE",
      text: "You walk away with a clearer outbound strategy and a better understanding of how to consistently win new cleaning contracts.",
    },
    bestCase: {
      label: "BEST CASE",
      text: "You install a system that books qualified sales calls with decision-makers every month — so you never depend on referrals alone again.",
    },
    ctaButtonText: "Book a Strategy Call",
    subtext:
      "No pressure. No commitment.\nJust a clear conversation about whether this system fits your cleaning business.",
  },

  footer: {
    companyName: "Evergreen Systems",
  },
};
