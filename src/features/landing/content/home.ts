import type { LandingPageContent } from "../types";

export const homeContent: LandingPageContent = {
  slug: "home",
  displayName: "Home",

  header: {
    title: "Header",
    ctas: [
      {
        id: "header-get-in-touch",
        label: "Get in Touch",
        url: "https://calendly.com/hello-evergreensystems/evergreensystems",
        style: "primary",
      },
    ],
  },

  hero: {
    title:
      "We Build and Run Outbound Systems \nThat Book [[**Qualified Sales Calls**]]",
    subtitle:
      "An always-on outbound system that runs in the background while you focus on closing.",
    eyebrow: "For B2B Founders Who Need Predictable Clients",
    mainMediaId: "c75d439e-00de-40ae-a874-30a7acb9d0ef",
    ctas: [
      {
        id: "hero-book-qualification-call",
        label: "Book a Qualification Call",
        url: "https://calendly.com/hello-evergreensystems/evergreensystems",
        style: "primary",
        subtitle:
          "A short call to see if this system makes sense for your business.",
      },
    ],
  },

  logos: {
    title: "Built with industry-leading data & automation tools",
    items: [
      { name: "n8n", slug: "n8n" },
      { name: "Instantly", slug: "instantly" },
      { name: "Apify", slug: "apify" },
      { name: "Apollo", slug: "apollo" },
      { name: "BuiltWith", slug: "builtwith" },
      { name: "Clutch", slug: "clutch" },
      { name: "ColdSire", slug: "coldsire" },
      { name: "Crunchbase", slug: "crunchbase" },
      { name: "G2", slug: "g2" },
      { name: "NeverBounce", slug: "neverbounce" },
      { name: "OpenAI", slug: "openai" },
      { name: "Outscraper", slug: "outscraper" },
      { name: "StoreLeads", slug: "storeleads" },
      { name: "Supabase", slug: "supabase" },
      { name: "Vercel", slug: "vercel" },
    ],
  },

  offer: {
    title: "[[**What you get**]]",
    features: [
      {
        id: "icp-research",
        title: "ICP Research & Targeting Blueprint",
        subtitle:
          "We define your ICP precisely (roles, industries, signals, exclusions) so every message targets buyers who can actually convert.",
        icon: "fa-bullseye",
      },
      {
        id: "lead-sourcing",
        title: "Qualified Lead Sourcing & Enrichment",
        subtitle:
          "We identify ideal prospects and deeply enrich each lead using company websites, public pages, role context, and buying signals — so outreach is based on real information, not surface-level data.",
        icon: "fa-database",
      },
      {
        id: "messaging-frameworks",
        title: "Library & Messaging Frameworks",
        subtitle:
          "We apply proven personalization logic and messaging patterns inside every email — using our experience to make outreach feel relevant, human, and context-aware.",
        icon: "fa-wand-magic-sparkles",
      },
      {
        id: "end-to-end-system",
        title: "End-to-End Outbound System (Done-For-You)",
        subtitle:
          "We handle sourcing, writing, sending, follow-ups, and booking—fully managed, always-on, and improved over time.",
        icon: "fa-gears",
      },
      {
        id: "calendar-ready-calls",
        title: "Calendar-Ready Sales Calls",
        subtitle:
          "Qualified prospects get booked directly onto your calendar. You don't chase leads—you show up to real conversations.",
        icon: "fa-calendar-check",
      },
      {
        id: "show-up-reduction",
        title: "Show-Up & No-Show Reduction",
        subtitle:
          "We add confirmation + reminder logic and framing that reduces no-shows and improves call quality.",
        icon: "fa-user-check",
      },
      {
        id: "crm-integration",
        title: "CRM & Pipeline Integration",
        subtitle:
          "We track every lead, message, reply, and booked call inside our internal systems so nothing is lost and performance is fully documented as the system runs.",
        icon: "fa-diagram-project",
      },
      {
        id: "continuous-optimization",
        title: "Continuous Optimization & Iteration",
        subtitle:
          'We A/B test targeting and messaging continuously to improve performance instead of "one-and-done" campaigns.',
        icon: "fa-chart-line",
      },
    ],
  },

  timeline: {
    title: "[[**Timeline**]]",
    steps: [
      {
        id: "alignment-discovery",
        title: "Alignment & Discovery",
        subtitle:
          "We start with a focused discovery call to understand your business, offer, ideal buyers, and revenue goals. This gives us the context to build the system correctly from day one.",
        icon: "fa-magnifying-glass",
        badge: "ICP & offer alignment",
      },
      {
        id: "infrastructure-warmup",
        title: "Outbound Infrastructure & Warm-Up",
        subtitle:
          "We set up and warm your outbound infrastructure so emails land safely in inboxes — not spam. This includes inbox setup, domain configuration, and a controlled warm-up phase to protect deliverability from day one.",
        icon: "fa-server",
        badge: "Inbox-safe setup",
      },
      {
        id: "icp-targeting",
        title: "ICP Definition & Targeting",
        subtitle:
          "We define your ideal customer profile in detail — roles, industries, buying signals, exclusions — so outreach is aimed only at people who can actually convert.",
        icon: "fa-bullseye",
        badge: "Buyer-level targeting",
      },
      {
        id: "system-build",
        title: "System Build & Infrastructure",
        subtitle:
          "We build the complete outbound system: infrastructure, personalization logic, messaging frameworks, follow-ups, and booking flow — fully done-for-you.",
        icon: "fa-gears",
        badge: "System goes live",
      },
      {
        id: "lead-sourcing-launch",
        title: "Lead Sourcing, Enrichment & Launch",
        subtitle:
          "We source and enrich leads with real context, then launch campaigns that send highly personalized emails that feel like 1-to-1 introductions — not cold blasts.",
        icon: "fa-database",
        badge: "Personalized outreach",
      },
      {
        id: "booked-calls-optimization",
        title: "Booked Calls & Ongoing Optimization",
        subtitle:
          "We manage replies, book qualified calls directly to your calendar, reduce no-shows, and continuously optimize targeting and messaging to improve results over time.",
        icon: "fa-calendar-check",
        badge: "Only pay per result",
      },
    ],
  },

  faq: {
    title: "Frequently asked [[**questions**]]",
    eyebrow: "faq",
    faqs: [
      {
        id: "what-does-evergreen-handle",
        question: "What does Evergreen Systems actually handle?",
        answer:
          "Evergreen Systems builds, runs, and manages the entire outbound system end-to-end.\nThis includes targeting, outreach, follow-ups, automation, and ongoing optimization.\nYour only responsibility is showing up to qualified sales calls booked directly into your calendar.",
      },
      {
        id: "performance-guarantee",
        question: "How does your performance guarantee work?",
        answer:
          "Our engagements are performance-aligned.\nOnce the system is fully live, you're only charged for months where we deliver the agreed minimum number of qualified, attended calls.\nIf that minimum isn't met in a given month, you're not charged for that period.",
      },
      {
        id: "how-quickly-calls",
        question: "How quickly does the system start delivering calls?",
        answer:
          "Every engagement begins with a short setup phase where we build, configure, and safely prepare your outbound infrastructure.\nThis typically takes 2–3 weeks, after which the system goes live and starts generating initial replies and conversations.",
      },
      {
        id: "how-involved",
        question: "How involved do I need to be?",
        answer:
          "Very little.\nWe handle setup, execution, and ongoing optimization end-to-end.\nYour only responsibility is showing up to qualified sales calls once the system is live.",
      },
      {
        id: "ongoing-or-one-time",
        question: "Is this a one-time campaign or an ongoing system?",
        answer:
          "This is an ongoing outbound system, not a one-off campaign.\nPerformance improves over time as data compounds and targeting is refined.\nMost clients stay engaged for multiple months to build a consistent, predictable acquisition channel.",
      },
      {
        id: "good-fit",
        question: "Who is this a good fit for — and who isn't?",
        answer:
          "This works best for B2B companies with a clear offer and the capacity to handle new sales conversations.\nIt's not a fit for businesses without follow-up capability or those looking for instant, short-term spikes.",
      },
    ],
  },

  results: {
    title: "System Benchmarks",
    primary: [
      {
        id: "qualified_conversations",
        icon: "users",
        label: "Qualified Sales Conversations",
        value: "System-driven",
        description:
          "Built to consistently generate relevant, buyer-ready conversations — not random leads.",
      },
      {
        id: "predictable_pipeline",
        icon: "calendar-check",
        label: "Predictable Pipeline",
        value: "Always-on",
        description:
          "An outbound system designed to run continuously instead of relying on timing or referrals.",
      },
    ],
    secondary: [
      {
        id: "time_reclaimed",
        icon: "clock",
        label: "Founder Time Reclaimed",
        value: "Hands-off",
        description:
          "We run targeting, sending, follow-ups, and booking so you stay out of the weeds.",
      },
      {
        id: "deliverability_safe",
        icon: "server",
        label: "Inbox-Safe Infrastructure",
        value: "Protected",
        description:
          "Warm-up, domain safety, and deliverability handled from day one.",
      },
      {
        id: "performance_pricing",
        icon: "arrow-up",
        label: "Performance-Aligned Pricing",
        value: "Pay per result",
        description:
          "You only pay when qualified calls are booked — risk stays with us.",
      },
    ],
  },

  cta: {
    title: "Start Getting Calls",
    eyebrow: "ready?",
    subtitle:
      "Worst case: Get a clearer strategy. Best case: Start Getting Qualified Sales Calls",
    ctas: [
      {
        id: "cta-book-strategy-call",
        label: "Book a Strategy Call",
        url: "https://calendly.com/hello-evergreensystems/evergreensystems",
        style: "primary",
        subtitle: "No pressure. Just a clear look at whether this fits.",
      },
    ],
  },

  footer: {
    companyName: "Evergreen Systems",
    subtitle: "AI-powered solutions for modern teams.",
    socialPlatforms: [
      {
        name: "Linkedin",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/1024px-LinkedIn_icon.svg.png",
        url: "https://www.linkedin.com/in/mihai-pol/",
      },
    ],
  },
};
