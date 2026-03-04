// ─── Shared Primitives ──────────────────────────────────────

export interface CTAButton {
  /** Unique slug for analytics tracking (e.g. "hero-book-call") */
  id: string;
  label: string;
  url: string;
  style: "primary" | "secondary" | "outline";
  subtitle?: string;
  icon?: string;
}

// ─── Per-Section Content Types ──────────────────────────────

export interface HeaderContent {
  title: string;
  ctas: CTAButton[];
}

export interface HeroContent {
  /** Supports rich text: **bold**, [[gradient]], \n */
  title: string;
  subtitle: string;
  eyebrow: string;
  /** Media table UUID for the hero video/image */
  mainMediaId: string;
  ctas: CTAButton[];
}

export interface LogoItem {
  name: string;
  slug: string;
}

export interface LogosContent {
  title: string;
  items: LogoItem[];
}

export interface OfferFeature {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface OfferContent {
  /** Supports rich text: [[**bold gradient**]] */
  title: string;
  features: OfferFeature[];
}

export interface TimelineStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
}

export interface TimelineContent {
  /** Supports rich text */
  title: string;
  steps: TimelineStep[];
}

export interface FAQItem {
  id: string;
  question: string;
  /** Supports \n for line breaks */
  answer: string;
}

export interface FAQContent {
  /** Supports rich text */
  title: string;
  eyebrow: string;
  faqs: FAQItem[];
}

export interface ResultMetric {
  id: string;
  icon: string;
  label: string;
  value: string;
  description: string;
}

export interface ResultsContent {
  title: string;
  primary: ResultMetric[];
  secondary: ResultMetric[];
}

export interface CTASectionContent {
  title: string;
  eyebrow: string;
  subtitle: string;
  ctas: CTAButton[];
}

export interface SocialPlatform {
  name: string;
  icon: string;
  url: string;
}

export interface FooterContent {
  companyName: string;
  subtitle: string;
  socialPlatforms: SocialPlatform[];
}

// ─── Composed Full Landing Page Content ─────────────────────

export interface LandingPageContent {
  /** Identifier for CSS preset class & routing */
  slug: string;
  /** Display name for admin/internal use */
  displayName: string;

  header: HeaderContent;
  hero: HeroContent;
  logos: LogosContent;
  offer: OfferContent;
  timeline: TimelineContent;
  faq: FAQContent;
  results: ResultsContent;
  cta: CTASectionContent;
  footer: FooterContent;
}
