// ─── Per-Section Content Types ───────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderContent {
  logoText: string;
  ctaButtonText: string;
  ctaUrl?: string;
  ctaId?: string;
  navLinks: NavLink[];
}

export interface HeroContent {
  badgeText: string;
  /** Supports rich text: **bold**, [[gradient]], ((primary)), \n */
  headline: string;
  subheadline: string;
  ctaButtonText: string;
  ctaUrl?: string;
  ctaId?: string;
  /** Supports rich text */
  bottomText: string;
  videoPlaceholderText: string;
}

export interface OutcomesContent {
  /** Optional small section label rendered above the heading. */
  eyebrow?: string;
  heading: string;
  subheading: string;
  benefits: string[];
  valueProp: string;
  valueSubtext: string;
  qualifiedDefinition?: string;
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
  /** Optional small section label rendered above the heading. */
  eyebrow?: string;
  heading: string;
  subheading?: string;
  benchmarks: BenchmarkItem[];
  /** Supports rich text */
  bottomStatement?: string;
}

export interface WhyOutboundContent {
  sectionId: string;
  /** Optional small section label rendered above the first subsection heading. */
  eyebrow?: string;
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
    oldWay?: { label: string; text: string };
    newWay?: { label: string; text: string };
    /** Supports rich text */
    closingStatement?: string;
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
  /** Subsection 5: Key insight / why it matters. Optional — omit to drop the entire summary block. */
  keyInsight?: {
    badgeText: string;
    heading: string;
    introText: string;
    failureReasons: string[];
    closingStatement: string;
  };
}

export interface SystemDiagramContent {
  sectionId?: string;
  /** Optional small section label rendered above the heading. */
  eyebrow?: string;
  heading: string;
  subheading?: string;
  /** Path to the image asset, served from /public. e.g. "/diagrams/email-infrastructure.png" */
  imageSrc: string;
  /** Alt text for accessibility. */
  imageAlt: string;
  /** Optional caption rendered below the image. */
  caption?: string;
}

export interface WhatYouGetContent {
  sectionId: string;
  /** Optional small section label rendered above the heading. */
  eyebrow?: string;
  /** Supports rich text */
  heading: string;
  subheading?: string;
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
  /** Optional small section label rendered above the heading. */
  eyebrow?: string;
  heading: string;
  subheading?: string;
  steps: TimelineStep[];
  successBox?: {
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
  /** Opt-in two-column layout (price card left, guarantee card right). Default stacks. */
  layout?: "two-column" | "stacked";
  /** Big section headline rendered above the cards in two-column layout. */
  sectionTitle?: string;
  price?: {
    badgeText?: string;
    setupAmount: string;
    setupLabel: string;
    monthlyAmount: string;
    monthlyLabel: string;
    /** Supports rich text */
    roiNote?: string;
  };
  includedHeading?: string;
  includedSubheading?: string;
  includes?: string[];
  /** Supports rich text */
  pricingNote: string;
  /** Optional inline CTA rendered below the cards in two-column layout. */
  cta?: {
    label: string;
    url: string;
    id?: string;
  };
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
  /** Optional italic-serif accent rendered inline after `heading` (minimal layout only). */
  headingAccent?: string;
  subheading: string;
  worstCase?: { label: string; text: string };
  bestCase?: { label: string; text: string };
  ctaButtonText: string;
  ctaUrl?: string;
  ctaId?: string;
  /** Supports rich text */
  subtext?: string;
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
  systemDiagram?: SystemDiagramContent;
  whatYouGet: WhatYouGetContent;
  comparison?: ComparisonContent;
  timeline: TimelineContent;
  pricing: PricingContent;
  faq: FAQContent;
  finalCta: FinalCTAContent;
  footer: FooterContent;
}
