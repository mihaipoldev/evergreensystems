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
  | "linkedin";

export interface NavLink {
  label: string;
  href: string;
}

export interface Cta {
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
  faq: {
    eyebrow: string;
    headingEm: string;
    headingDim: string;
    items: { q: string; a: string }[];
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
