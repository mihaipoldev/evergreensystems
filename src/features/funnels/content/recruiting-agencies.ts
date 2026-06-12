import type { FunnelContent } from "../types";

export const recruitingAgenciesContent: FunnelContent = {
  slug: "recruiting-agencies",
  displayName: "Recruiting Agencies",
  routePath: "for/recruiting-agencies",

  header: {
    logoText: "Evergreen Sys.",
    ctaButtonText: "Book Call",
    ctaUrl: "https://calendly.com/mihai-evergreensystems/growth-strategy-call",
    ctaId: "426f5869-48b5-4e36-bad3-203ea5425f9d",
    navLinks: [
      { label: "Outcomes", href: "#expected-outcomes" },
      { label: "Why", href: "#why-outbound" },
      { label: "Deliverables", href: "#what-you-get" },
      { label: "Pricing", href: "#pricing" },
    ],
  },

  hero: {
    badgeText: "For Recruiting Agency Owners Who Want a Steady BD Pipeline",
    headline: "We Build & Run Outbound Systems That \n [[Book Hiring-Manager Calls]]",
    subheadline:
      "An always-on BD pipeline that runs while you're buried in delivery.",
    ctaButtonText: "Book a qualification call",
    ctaUrl: "https://calendly.com/mihai-evergreensystems/growth-strategy-call",
    bottomText: "10 qualified hiring-manager calls in 90 days ((guaranteed!))",
    videoPlaceholderText: "Watch the overview",
  },

  outcomes: {
    eyebrow: "Outcomes",
    heading: "Get consistent, qualified hiring-manager calls",
    subheading:
      "At least 10 qualified hiring-manager calls within 90 days of campaign launch.",
    benefits: [
      "Without managing a BDR who quits inside 14 months",
      "Without paying $5K-$15K/month for a fractional VP who designs the playbook and never runs it",
      "Without waiting six months for a content agency to produce a single meeting",
    ],
    valueProp:
      "We build and run the entire outbound system end-to-end.",
    valueSubtext:
      "You only show up to calls booked directly on your calendar.",
    qualifierText:
      "**Only for owners or managing partners of boutique recruiting or search agencies in the US or Canada that place permanent hires.** Not for solo recruiters, temp or contract-labor staffing firms, or agencies looking for guaranteed placements.",
  },

  benchmarks: {
    sectionId: "expected-outcomes",
    eyebrow: "The Numbers",
    heading: "What changes for you",
    benchmarks: [
      {
        title: "Qualified Hiring-Manager Calls",
        value: "10-15",
        description: "booked in 90 days from kickoff",
        subtext:
          "Floor of 10 is guaranteed. The first ~30 days goes to infrastructure warmup, so calls land in months 2 and 3 at roughly 5-7 per month during active sending.",
      },
      {
        title: "Your Hours on BD",
        value: "0",
        description: "hours of your time per week after kickoff",
        subtext:
          "We handle sourcing, sending, replies, and booking. Your only job is showing up to the calls that land on your calendar.",
      },
      {
        title: "Your Pipeline",
        value: "Always-on",
        description: "runs in parallel with delivery, even when reqs pile up",
        subtext:
          "The feast-or-famine cycle breaks. New hiring-manager conversations keep landing through every delivery spike, because the engine does not depend on your time.",
      },
    ],
  },

  whyOutbound: {
    sectionId: "why-outbound",
    eyebrow: "Why Outbound",
    whyItWorks: {
      heading: "Why cold outreach works",
      introText:
        "Recruiting agencies have three ways to find new clients. Two break exactly when delivery loads up.",
      methods: ["Referrals", "LinkedIn InMail", "Cold Outreach"],
      paragraphs: [
        "Referrals dry up when delivery is heavy. LinkedIn InMail response rates dropped from 20-25% to 6-8% in three years.",
        "Cold outreach, run from outside the business, keeps producing through every delivery spike.",
      ],
      closingStatement:
        "**Hiring-manager conversations** at companies actively hiring for the roles you place, every month.",
    },
    traditionalFails: {
      heading: "Why traditional cold email fails in recruiting",
      introText: "Most cold email sent by recruiting agencies looks the same:",
      failurePoints: [
        "Broad scraped lists, no signal filtering",
        "Generic templates that don't know the agency",
        "Candidate-side framing ('we fill your roles faster')",
        "Replies that pile up because no one works the inbox",
      ],
      keyMessage:
        "You don't need more names.\nYou need ((hiring-manager conversations at companies actively hiring for the roles you place)).",
    },
    enrichment: {
      heading: 'What "enrichment" actually means',
      introText:
        "Every prospect is processed through an enrichment layer before any message goes out. We add real context:",
      checks: [
        "Decision-maker identification (founder, hiring manager, or head of talent)",
        "Recent funding or growth, headcount changes, leadership changes",
        "Open roles that match what you place, by seniority and location",
        "Recent buying signals (recently funded or expanding, posted reqs in the last 30 days)",
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
        text: "Email providers don't trust new sending domains. Sending too much from a cold domain triggers spam filtering or burns the domain permanently. Hiring managers are extra-sensitive because they're pitched daily by job boards, ATSes, and rival agencies.",
      },
    },
  },

  systemDiagram: {
    sectionId: "the-system",
    eyebrow: "Inside the System",
    heading: "The machine we run for you",
    subheading:
      "Apollo sources hiring decision-makers, the Evergreen Portal orchestrates, 24 dedicated mailboxes send, replies route back. You touch none of it.",
    imageSrc: "/diagrams/email-infrastructure.png",
    imageAlt:
      "Diagram of the Evergreen sending system: Evergreen Portal at the top, 8 sending domains with 3 inboxes each, flowing through Apollo Leads and Instantly down to Sales Calls and Paying Clients.",
  },

  whatYouGet: {
    sectionId: "what-you-get",
    eyebrow: "Deliverables",
    heading: "What you get ((done for you))",
    deliverables: [
      "A precise ICP and targeting blueprint, so outreach only hits buyers who can convert",
      "Dedicated sending domains, kept separate from yours so your reputation stays safe",
      "Verified companies that are actively hiring for the roles you place",
      "Email sequences written in your voice and personalized per prospect",
      "We answer every reply for you, in your voice, and qualify real interest",
      "Qualified calls booked straight to your calendar, with each prospect prepped",
      "Reminders and confirmations on every call to cut no-shows",
      "Live tracking of every lead and call, with ongoing optimization",
    ],
    bottomNegatives: [],
    closingStatement: "You just show up to calls with people who are hiring.",
  },

  timeline: {
    eyebrow: "How It Works",
    heading: "From kickoff to qualified calls",
    steps: [
      {
        step: "Step 1",
        title: "Alignment and Discovery",
        description:
          "We start by aligning on your ICP, sender voice, qualification criteria, and the kinds of conversations that move your business.",
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
          "While inboxes warm up, hiring decision-makers at companies actively hiring for the roles you place are sourced and enriched. One contact per company.",
      },
      {
        step: "Step 5",
        title: "Sequence Build and Reply Handling Setup",
        description:
          "A sequence is written in your voice for the recruiting niche, with per-prospect personalization at send time. Reply handling and booking flow configured.",
      },
      {
        step: "Step 6",
        title: "Launch and Optimization",
        description:
          "Cold sends go live. We handle every inbound end-to-end and book qualified hiring-manager calls directly to your calendar with a pre-call brief. Performance is reported, the system tuned on real data.",
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
        "((One placement covers the full year.)) At a typical 15-25% fee on a single hire, one close can pay for the entire engagement.",
    },
    pricingNote:
      "Founding-cohort rate for the first agencies we work with. Exact scope confirmed on a quick call.",
    cta: {
      label: "Book a 15-minute call",
      url: "https://calendly.com/mihai-evergreensystems/growth-strategy-call",
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
          text: "**10 qualified hiring-manager calls in 90 days. Miss it, and every dollar comes back, setup and retainer both.** Only tool costs are excluded.",
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
        question: "We get most of our clients through referrals. Why do we need this?",
        answer:
          "Referrals are the best clients you'll ever get. The problem is they dry up exactly when you need them most, when delivery is heavy and you stop showing up in the network. This isn't a replacement for referrals. It runs in parallel: you keep the referrals, we add a second channel that produces conversations whether you're networking or not.",
      },
      {
        question: "We've tried cold email before. What's different here?",
        answer:
          "Most boutique recruiting agencies that have tried cold email stopped because of one of two failure patterns: (1) doing it yourself and stopping when delivery loads up, or (2) hiring a generalist agency with niche-agnostic copy and broad lists. We run recruiting-only, signal-verified prospects (companies with open roles you can fill and recent hiring signals), and the system does not stop when your delivery ramps. That is the structural difference.",
      },
      {
        question: "Hiring managers get pitched constantly. Why would they respond?",
        answer:
          "Most cold email they get is candidate-side: \"I can fill your role faster.\" Our angle is BD-side and addresses a pain they have. Recruiting is a sales-driven industry, so these buyers respond when the email is targeted and relevant. The system also sends one contact per company, which roughly doubles reply rates versus mass-blasting a leadership team.",
      },
      {
        question: "We're already doing some BD. Does this replace it?",
        answer:
          "Either, depending on what you've got. Most agencies we talk to have tried one or two things before us: an in-house BDR, a fractional sales lead, their own LinkedIn outreach. The reason they layer us in or switch is that those options all stop working the moment delivery ramps, because they depend on someone inside the business having time. We don't. So we either replace what isn't working or run alongside what is.",
      },
      {
        question: "Companies are bringing recruiting in-house. Why invest in BD now?",
        answer:
          "Real concern, and it's been the macro story across most markets lately. Two things. The agencies that survive are the ones who place specialized or hard-to-fill roles that in-house teams can't cover. The agencies that grow are the ones who fixed their BD before the market tightened. A tighter market is exactly why BD matters now: the agencies that show up are taking share.",
      },
      {
        question: "Does this take time away from delivery?",
        answer:
          "Zero owner time after kickoff. We handle sourcing, enrichment, sending, replies, and booking. Your job is showing up to the calls that land on your calendar, with a pre-call brief so you walk in already knowing the company, the open roles, and the angle. The whole point is to run the BD engine in parallel with delivery, not from inside it.",
      },
      {
        question: "Do you source candidates too?",
        answer:
          "No. We are pure BD-side. We book hiring-manager conversations for you but do not operate on the candidate side. That is your domain and we do not dilute it.",
      },
    ],
  },

  finalCta: {
    heading: "Book a 15-minute\ncall to see",
    headingAccent: "if it's a fit.",
    subheading:
      "No pitch, no pressure. Just an honest read on whether we can help.",
    ctaButtonText: "Book a 15-minute call",
    ctaUrl: "https://calendly.com/mihai-evergreensystems/growth-strategy-call",
  },

  footer: {
    companyName: "Evergreen Systems",
  },
};
