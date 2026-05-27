import type { FunnelContent } from "../types";

export const recruitingAgenciesContent: FunnelContent = {
  slug: "recruiting-agencies",
  displayName: "Tech Recruiting Agencies",
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
    badgeText: "For Tech Recruiting Agency Owners Who Want a Steady BD Pipeline",
    headline: "We Build & Run Outbound Systems That \n [[Book Qualified Hiring-Manager Calls]]",
    subheadline:
      "An always-on BD pipeline that runs while you're buried in delivery.",
    ctaButtonText: "Book a Qualification Call",
    ctaUrl: "https://calendly.com/mihai-evergreensystems/growth-strategy-call",
    bottomText: "10 qualified hiring-manager calls in 90 days ((guaranteed!))",
    videoPlaceholderText: "Watch the overview",
  },

  outcomes: {
    heading: "Get Consistent, Qualified Hiring-Manager Calls",
    subheading:
      "At least 10 qualified hiring-manager calls within 90 days of campaign launch",
    benefits: [
      "Without managing a BDR who quits inside 14 months",
      "Without paying $5K-$15K/month for a fractional VP who designs the playbook and never runs it",
      "Without waiting six months for a content agency to produce a single meeting",
    ],
    valueProp:
      "We build and run the entire outbound system for you, end-to-end.",
    valueSubtext:
      "You only show up to calls booked directly on your calendar.",
    qualifiedDefinition:
      "A booked call with a hiring decision-maker (VP Engineering, Head of Talent, CTO, or founder/CEO) at a US or Canada tech company actively hiring engineers.",
    qualifierText:
      "**ℹ️ Only for owners or managing partners of boutique tech recruiting agencies in the US or Canada.** Not for solo recruiters, generalist staffing firms, or agencies looking for guaranteed placements.",
  },

  benchmarks: {
    sectionId: "expected-outcomes",
    heading: "What Changes for You",
    subheading: "What changes the moment the system is live.",
    benchmarks: [
      {
        title: "Qualified Hiring-Manager Calls",
        value: "10-15",
        description: "booked in 90 days from kickoff",
        subtext:
          "Floor of 10 is guaranteed. First ~30 days is infrastructure warmup, so calls land in months 2 and 3 at roughly 5-7 per month during active sending.",
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
        value: "Always on",
        description: "runs in parallel with delivery, even when reqs pile up",
        subtext:
          "The feast-or-famine cycle breaks. New hiring-manager conversations keep landing through every delivery spike, because the engine does not depend on your time.",
      },
    ],
  },

  whyOutbound: {
    sectionId: "why-outbound",
    whyItWorks: {
      heading: "Why Cold Outreach Works When Other Channels Stop Working",
      introText:
        "Those calls come from one channel the others can't replace: cold outreach to hiring managers, run from outside your business. Recruiting agencies have three ways to find new clients, and two of them break down at the worst possible moment.",
      methods: ["Referrals", "LinkedIn InMail", "Cold Outreach"],
      paragraphs: [
        "Referrals dry up when delivery loads up. LinkedIn InMail response rates dropped from 20-25% to 6-8% in three years. Both channels break exactly when the pipeline needs to refill.",
        "Cold outreach run from outside the business is the one channel that keeps producing through every delivery spike.",
      ],
      closingStatement:
        "**Hiring-manager conversations** at companies actively building tech teams, every month.",
    },
    traditionalFails: {
      heading: "Why Traditional Cold Email Fails in Recruiting",
      introText: "Most cold email aimed at recruiting agencies looks the same:",
      failurePoints: [
        "Broad scraped lists, no signal filtering",
        "Generic templates that don't know the agency",
        "Candidate-side framing ('we fill your roles faster')",
        "Replies that pile up because no one works the inbox",
      ],
      keyMessage:
        "You don't need more names.\nYou need ((hiring-manager conversations at companies actively building tech teams)).",
    },
    enrichment: {
      heading: 'What "Enrichment" Actually Means',
      introText:
        "Every prospect is processed through an enrichment layer before any message goes out. We add real context:",
      checks: [
        "Decision-maker identification (VP Engineering / Head of Talent / CTO / founder)",
        "Funding stage, headcount growth, recent leadership changes",
        "Open engineering roles by stack and seniority",
        "Recent buying signals (funded in the last 6 months, posted reqs in the last 30 days)",
      ],
      closingText:
        "Every email lands with **information**, not assumptions.",
    },
    sending: {
      heading: "How We Protect Your Sender Reputation",
      introText:
        "Great targeting means nothing if emails land in spam. The sending infrastructure is built to **protect your sender reputation** from day one:",
      items: [
        "Outreach goes from dedicated secondary domains, never your main domain",
        "Per-inbox volume capped so sending behavior stays natural",
        "21-28 day domain warmup before any cold send",
        "Every reply handled by us, no manual inbox triage on your side",
      ],
      infoBox: {
        title: "Why Warmup Matters",
        text: "Email providers don't trust new sending domains. Sending too much from a cold domain triggers spam filtering or burns the domain permanently. Recruiting buyers are extra-sensitive because they're pitched daily by job boards, ATSes, and rival agencies.",
      },
    },
    keyInsight: {
      badgeText: "Key Insight",
      heading: "The Bottom Line",
      introText: "Cold email in recruiting fails for many reasons:",
      failureReasons: [
        "Wrong angle (candidate-side framing instead of BD-side)",
        "Generic copy with no signal verification",
        "Broad scraped lists with no ICP filtering",
        "Cold domains that land straight in spam",
        "Positive replies that pile up and die because no one handles the inbox",
      ],
      closingStatement: "This system handles all of them. That's what produces hiring-manager calls instead of activity reports.",
    },
  },

  whatYouGet: {
    sectionId: "what-you-get",
    heading: "What You Get ((Done For You))",
    deliverables: [
      "ICP research and targeting for funded tech companies actively hiring engineers",
      "Lead sourcing across VP Engineering, Head of Talent, CTOs, and founders at your target accounts",
      "Per-prospect enrichment (funding stage, open roles, leadership changes, hiring signals)",
      "Purchase and setup of dedicated secondary sending domains, separated from your main domain",
      "Provisioning of sending inboxes across those domains, scaled to your target volume",
      "Full deliverability setup: domain authentication, warmup, and reputation monitoring",
      "Custom sequence written in your voice for the recruiting niche, with per-prospect personalization at send time",
      "We reply to every inbound, end-to-end, with no inbox triage on your side",
      "Qualified hiring-manager calls booked directly to your calendar with a pre-call brief",
      "Ongoing performance diagnostic and funnel reporting",
    ],
    bottomNegatives: [
      "✗ You do not manage tools",
      "✗ You do not chase replies",
      "✗ You do not babysit campaigns",
    ],
    closingStatement: "You show up to calls with hiring managers actively building tech teams.",
  },

  timeline: {
    heading: "How This Works",
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
          "Dedicated secondary domains and sending inboxes are purchased and configured, scaled to your target volume. Full domain authentication setup. Your main domain is never used.",
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
          "While inboxes warm up, hiring decision-makers at funded tech companies are sourced and enriched. One contact per company.",
      },
      {
        step: "Step 5",
        title: "Sequence Build and Reply Handling Setup",
        description:
          "A sequence is written in your voice for the recruiting niche, scaled to what fits your prospects, with per-prospect personalization. Reply handling and booking flow configured.",
      },
      {
        step: "Step 6",
        title: "Launch and Optimization",
        description:
          "Cold sends go live. We handle every inbound reply end-to-end. Qualified hiring-manager calls book directly to your calendar with a pre-call brief. Performance reported and the system tuned continuously based on real data.",
      },
    ],
  },

  pricing: {
    sectionId: "pricing",
    price: {
      badgeText: "Founding Rate",
      setupAmount: "$2,000",
      setupLabel: "one-time setup",
      monthlyAmount: "$2,000",
      monthlyLabel: "per month",
      roiNote:
        "((One senior tech placement covers the full year.)) At a typical 20% fee on a $150K+ hire, that's a $30K+ fee from a single close.",
    },
    pricingNote:
      "Founding-cohort rate for the first agencies we work with. Exact scope confirmed on a quick call.",
    guarantee: {
      badgeText: "Performance Guarantee",
      heading: "We Remove the Downside Completely",
      steps: [
        {
          text: "A **one-time setup fee** builds your system.",
        },
        {
          text: "A **monthly fee** runs it once it goes live.",
        },
        {
          text: "**10 qualified hiring-manager calls in 90 days. Miss it, and every retainer dollar comes back.** Tool costs excluded.",
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
    heading: "Frequently Asked Questions",
    faqs: [
      {
        question: "We get most of our clients through referrals. Why do we need this?",
        answer:
          "Referrals are the best clients you'll ever get. The problem is they dry up exactly when you need them most, when delivery is heavy and you stop showing up in the network. This isn't a replacement for referrals. It runs in parallel: you keep the referrals, we add a second channel that produces conversations whether you're networking or not.",
      },
      {
        question: "We have tried cold email before, what's different here?",
        answer:
          "Most boutique recruiting agencies that have tried cold email stopped because of one of two failure patterns: (1) doing it yourself and stopping when delivery loads up, or (2) hiring a generalist agency with niche-agnostic copy and broad lists. We run recruiting-only, signal-verified prospects (companies with open engineering roles and recent hiring signals), and the system does not stop when your delivery ramps. That is the structural difference.",
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
        question: "Tech companies are bringing recruiting in-house. Why invest in BD now?",
        answer:
          "Real concern. That has been the macro story since the 2025 tech layoffs. Two things: the agencies that survive are the ones who deliver specialized roles in-house teams cannot fill (AI/ML, staff+ IC, security, niche stacks), and the agencies that survive and grow are the ones who fixed their BD before the market shrank. A shrinking market is exactly why investing in BD now matters: the agencies that show up are taking share.",
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
    heading: "Let's Talk",
    subheading:
      "Book a 15-minute call to see if this fits your agency.",
    ctaButtonText: "Book a Call",
    ctaUrl: "https://calendly.com/mihai-evergreensystems/growth-strategy-call",
    subtext:
      "No pitch, no pressure. Just an honest read on whether we can help.",
  },

  footer: {
    companyName: "Evergreen Systems",
  },
};
