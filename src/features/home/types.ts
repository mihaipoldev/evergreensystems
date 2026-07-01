// Types for the new homepage content. One typed object holds ALL copy
// (see ./content.ts) and is read directly by the components in
// src/components/home/ — no adapter, no DB.

/** Lucide icon name (resolved to a component in src/components/home/icons.ts). */
export type IconName =
  | "shield-check"
  | "server"
  | "user-round"
  | "zap"
  | "clock"
  | "arrow-right"
  | "mail"
  | "calendar"
  | "calendar-check"
  | "check"
  | "check-circle-2"
  | "search"
  | "x"
  | "linkedin";

export interface NavLink {
  label: string;
  href: string;
}

export interface Cta {
  /** Stable id used as the analytics entity_id for cta_button events. */
  id: string;
  label: string;
  href: string;
}

/** A trust-band chip: either a bold + muted pair, or a "prefix + link". */
export interface TrustItem {
  icon: IconName;
  bold?: string;
  muted?: string;
  prefix?: string;
  link?: { label: string; href: string };
}

export interface PlatformPoint {
  /** Leading bold fragment. */
  bold: string;
  /** Remaining (already includes the leading "— "). */
  rest: string;
}

export interface Screenshot {
  src: string;
  alt: string;
}

export interface Outcome {
  num: string;
  unit: string;
  accent?: boolean;
  title: string;
  body: string;
}

export interface SystemStage {
  k: string;
  title: string;
  body: string;
  end?: boolean;
}

/** Inline `**bold**` markers are supported in spec/step text via renderEmphasis. */
export interface GuaranteeStep {
  n: string;
  text: string;
}

export interface Niche {
  label: string;
  meta: string;
  live: boolean;
  href?: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string; icon?: IconName; external?: boolean }[];
}

/**
 * Calculator section — interactive, ungated. A simplified version of the
 * portal ROI model (booked calls → clients → revenue). The buyer's model:
 * WE put qualified calls on the calendar, they close them, here's what it's
 * worth. No outreach mechanics (sends/reply rates) — that's our concern.
 */
export interface CalculatorInputConfig {
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** Optional quick-pick chips shown under the slider. */
  presets?: number[];
}

export interface Calculator {
  eyebrow: string;
  headingEm: string;
  headingDim: string;
  lead?: string;
  inputs: {
    /** Qualified calls/month WE put on their calendar (our delivery). */
    calls: CalculatorInputConfig;
    /** What one new client is worth to them. */
    clientValue: CalculatorInputConfig;
    /** Their sales close rate (%). */
    closeRate: CalculatorInputConfig;
  };
  resultsTitle: string;
  /** Label under the big headline number. */
  headlineLabel: string;
  /** Grounding note under the inputs (the guarantee). */
  note: string;
  cta: Cta;
}

/**
 * Pricing — two PAYMENT models (not feature tiers): pay-per-qualified-lead
 * (performance, featured) and a flat monthly retainer. Same full service in
 * both — the shared `features` list — only the way you pay differs. Each card
 * shows a one-line `descriptor` so the difference is instant. "Get a Quote".
 */
export interface PricingPlan {
  /** Mono kicker above the name, e.g. "Model 01 · Performance". */
  kicker: string;
  name: string;
  /** One line: how this model works / who it's for. */
  descriptor: string;
  /** Optional pill tag (e.g. "Most flexible") shown top-right of the card. */
  tag?: string;
  /** The featured (navy) card. */
  featured?: boolean;
  /** Small print on this card (e.g. a setup fee that applies only here). */
  note?: string;
  /** Shared features to hide on this plan (e.g. the guarantee on pay-per-lead). */
  omitFeatures?: string[];
  cta: Cta;
}

export interface Pricing {
  eyebrow: string;
  headingEm: string;
  headingDim: string;
  sub: string;
  plans: PricingPlan[];
  /** Shared deliverables — identical in both cards (everything's included). */
  features: string[];
}

/**
 * "Get in touch" — the split soft-capture form (name / work email / area
 * select + reassurance points). Design-only for now: submit shows a success
 * panel, no network call. See the email-capture backend follow-up.
 */
export interface GetInTouch {
  eyebrow: string;
  headingEm: string;
  headingDim: string;
  lead: string;
  /** Reassurance trio shown beside the form. */
  points: string[];
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    areaLabel: string;
    areaPlaceholder: string;
    areaOptions: string[];
    submit: string;
  };
  /** Stable analytics entity_id for the submit button. */
  submitId: string;
  success: { heading: string; body: string };
}

/** Reusable inline email pill: capture intent, route to the booking link. */
export interface BookBar {
  lead: string;
  placeholder: string;
  buttonLabel: string;
  /** Stable analytics entity_id for the button. */
  buttonId: string;
  /** Where the button routes (the current booking link). */
  href: string;
}

/** Exit-intent modal: guarantee panel + email capture (design-only). */
export interface ExitIntent {
  guaranteeKicker: string;
  /** Rendered as stacked lines (e.g. ["10 calls", "in 90 days"]). */
  guaranteeNumLines: string[];
  guaranteeSub: string;
  guaranteeTags: { icon: IconName; label: string }[];
  eyebrow: string;
  heading: string;
  body: string;
  emailPlaceholder: string;
  submit: string;
  submitId: string;
  footPrefix: string;
  footLinkLabel: string;
  footHref: string;
  dismissLabel: string;
  success: string;
}

/** One "Four Pillars" row — copy only; the mock visual is keyed by index in
 * the component (it's decorative sample data). */
export interface Pillar {
  /** Mono index, e.g. "01". */
  k: string;
  /** Short pillar name, e.g. "Infrastructure". */
  label: string;
  title: string;
  body: string;
  points: string[];
}

export interface HomeContent {
  nav: {
    brandLogo: string;
    brandAlt: string;
    links: NavLink[];
    cta: Cta;
  };
  hero: {
    eyebrow: string;
    titleEm: string;
    titleDim: string;
    lead: string;
    cta: Cta;
  };
  trust: TrustItem[];
  platform: {
    eyebrow: string;
    headingEm: string;
    headingDim: string;
    lead: string;
    points: PlatformPoint[];
    screenshots: Screenshot[];
  };
  outcomes: {
    eyebrow: string;
    headingEm: string;
    headingDim: string;
    items: Outcome[];
  };
  calculator: Calculator;
  /** Founder-video section. Built but hidden until a real video exists. */
  vsl: {
    eyebrow: string;
    headingEm: string;
    headingDim: string;
    caption: string;
  };
  pillars: {
    eyebrow: string;
    headingEm: string;
    headingDim: string;
    items: Pillar[];
  };
  system: {
    eyebrow: string;
    headingEm: string;
    headingDim: string;
    stages: SystemStage[];
    diagram: Screenshot;
    /** Each entry may contain inline `**bold**`. */
    specs: string[];
  };
  guarantee: {
    eyebrow: string;
    heading: string;
    num: string;
    sub: string;
    steps: GuaranteeStep[];
    tags: string[];
  };
  pricing: Pricing;
  getInTouch: GetInTouch;
  bookBar: BookBar;
  exitIntent: ExitIntent;
  faq: {
    eyebrow: string;
    headingEm: string;
    headingDim: string;
    /** id is the analytics entity_id for faq_item events. */
    items: { id: string; q: string; a: string }[];
  };
  niches: {
    eyebrow: string;
    headingBefore: string;
    headingDim: string;
    headingAfter: string;
    lead: string;
    items: Niche[];
    foot: { text: string; linkLabel: string; linkHref: string; tail: string };
  };
  close: {
    pill: string;
    heading: string;
    sub: string;
    founder: {
      name: string;
      avatar: string;
      avatarAlt: string;
      linkedin: string;
      line: string;
    };
    cta: Cta;
  };
  footer: {
    brandLogo: string;
    brandAlt: string;
    tag: string;
    columns: FooterColumn[];
    copy: string;
  };
}
