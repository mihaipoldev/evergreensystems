// ─── Per-Section Content Types ───────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderContent {
  logoText: string;
  ctaButtonText: string;
  navLinks: NavLink[];
}

export interface HeroContent {
  badgeText: string;
  /** Supports rich text: **bold**, [[gradient]], ((primary)), \n */
  headline: string;
  subheadline: string;
  ctaButtonText: string;
  /** Supports rich text */
  bottomText: string;
  videoPlaceholderText: string;
}

export interface OutcomesContent {
  heading: string;
  subheading: string;
  benefits: string[];
  valueProp: string;
  valueSubtext: string;
  /** Supports rich text */
  qualifierText: string;
}

export interface BenchmarkItem {
  title: string;
  value: string;
  description: string;
  subtext: string;
}

export interface BenchmarksContent {
  sectionId: string;
  heading: string;
  subheading: string;
  benchmarks: BenchmarkItem[];
  /** Supports rich text */
  bottomStatement: string;
}

export interface WhyOutboundContent {
  sectionId: string;
  /** Subsection 1: Why outbound works */
  whyItWorks: {
    heading: string;
    introText: string;
    methods: string[];
    /** Supports rich text per paragraph */
    paragraphs: string[];
    /** Supports rich text */
    closingStatement: string;
  };
  /** Subsection 2: Why traditional lead gen fails */
  traditionalFails: {
    heading: string;
    introText: string;
    failurePoints: string[];
    /** Supports rich text */
    keyMessage: string;
    oldWay: { label: string; text: string };
    newWay: { label: string; text: string };
    /** Supports rich text */
    closingStatement: string;
  };
  /** Subsection 3: Enrichment explained */
  enrichment: {
    heading: string;
    /** Supports rich text */
    introText: string;
    checks: string[];
    /** Supports rich text */
    closingText: string;
  };
  /** Subsection 4: Sending infrastructure */
  sending: {
    heading: string;
    /** Supports rich text */
    introText: string;
    items: string[];
    infoBox: { title: string; text: string };
  };
  /** Subsection 5: Key insight / why it matters */
  keyInsight: {
    badgeText: string;
    heading: string;
    introText: string;
    failureReasons: string[];
    closingStatement: string;
  };
}

export interface WhatYouGetContent {
  sectionId: string;
  /** Supports rich text */
  heading: string;
  subheading: string;
  deliverables: string[];
  bottomNegatives: string[];
  closingStatement: string;
}

export interface ComparisonCard {
  title: string;
  /** Supports rich text */
  description: string;
  highlighted?: boolean;
  badge?: string;
}

export interface ComparisonContent {
  heading: string;
  subheading: string;
  cards: ComparisonCard[];
}

export interface TimelineStep {
  step: string;
  title: string;
  description: string;
}

export interface TimelineContent {
  heading: string;
  subheading: string;
  steps: TimelineStep[];
  successBox: {
    badgeText: string;
    heading: string;
    /** Supports rich text */
    text: string;
  };
}

export interface GuaranteeStep {
  /** Supports rich text */
  text: string;
  highlighted?: boolean;
}

export interface PricingContent {
  sectionId: string;
  includedHeading: string;
  includedSubheading: string;
  includes: string[];
  /** Supports rich text */
  pricingNote: string;
  guarantee: {
    badgeText: string;
    heading: string;
    steps: GuaranteeStep[];
    benefits: string[];
    closingStatement: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQContent {
  heading: string;
  faqs: FAQItem[];
}

export interface FinalCTAContent {
  heading: string;
  subheading: string;
  worstCase: { label: string; text: string };
  bestCase: { label: string; text: string };
  ctaButtonText: string;
  /** Supports rich text */
  subtext: string;
}

export interface FooterContent {
  companyName: string;
}

// ─── Composed Full Funnel Content ────────────────────────────

export interface FunnelContent {
  /** Identifier used for CSS preset class, e.g. "commercial-cleaning" → preset-commercial-cleaning */
  slug: string;
  /** Display name for admin UI, e.g. "Outbound Systems" */
  displayName: string;
  /** URL path (without leading slash), e.g. "for/commercial-cleaning". Defaults to slug if omitted. */
  routePath?: string;
  header: HeaderContent;
  hero: HeroContent;
  outcomes: OutcomesContent;
  benchmarks: BenchmarksContent;
  whyOutbound: WhyOutboundContent;
  whatYouGet: WhatYouGetContent;
  comparison: ComparisonContent;
  timeline: TimelineContent;
  pricing: PricingContent;
  faq: FAQContent;
  finalCta: FinalCTAContent;
  footer: FooterContent;
}
