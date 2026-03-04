/**
 * Adapter layer: transforms LandingPageContent sections into the shapes
 * that existing landing components expect (section + separate data arrays).
 *
 * This is a temporary bridge. Once components are refactored to accept
 * typed props directly, this file can be deleted.
 */

import type { LandingPageContent, CTAButton } from "./types";
import type { CTAButtonWithSection } from "@/features/media/types";
import type { MediaWithSection } from "@/features/media/types";
import type { Media } from "@/features/media/types";

// ─── Shared helpers ─────────────────────────────────────────

/** Convert our CTAButton to the old CTAButtonWithSection shape */
function adaptCTA(cta: CTAButton, index: number): CTAButtonWithSection {
  return {
    id: cta.id,
    label: cta.label,
    url: cta.url,
    style: cta.style,
    icon: null,
    subtitle: cta.subtitle ?? null,
    position: index,
    created_at: "",
    updated_at: "",
    section_cta_button: {
      id: cta.id,
      position: index,
      status: "published",
      created_at: "",
    },
  };
}

/** Build a minimal section object that all components expect */
function baseSection(id: string, type: string, overrides: Record<string, any> = {}) {
  return {
    id,
    type,
    title: null as string | null,
    admin_title: null as string | null,
    header_title: null as string | null,
    subtitle: null as string | null,
    eyebrow: null as string | null,
    content: null as any,
    media_url: null as string | null,
    page_section_id: id,
    position: 0,
    status: "published" as const,
    media: [] as MediaWithSection[],
    ctaButtons: [] as CTAButtonWithSection[],
    ...overrides,
  };
}

// ─── Per-section adapters ───────────────────────────────────

export function adaptHeader(content: LandingPageContent) {
  const section = baseSection("header", "header", {
    title: content.header.title,
    ctaButtons: content.header.ctas.map(adaptCTA),
  });
  return { section, ctaButtons: section.ctaButtons };
}

export function adaptHero(content: LandingPageContent, mediaRecord?: Media | null) {
  const media: MediaWithSection[] = mediaRecord
    ? [
        {
          ...mediaRecord,
          section_media: {
            id: `sm-${mediaRecord.id}`,
            role: "main",
            sort_order: 1,
            status: "published" as const,
            created_at: "",
          },
        },
      ]
    : [];

  const section = baseSection("hero", "hero", {
    title: content.hero.title,
    subtitle: content.hero.subtitle,
    eyebrow: content.hero.eyebrow,
    media,
    ctaButtons: content.hero.ctas.map(adaptCTA),
  });
  return { section, ctaButtons: section.ctaButtons };
}

export function adaptLogos(content: LandingPageContent) {
  const section = baseSection("logos", "logos", {
    title: content.logos.title,
    position: 3,
  });

  const softwares = content.logos.items.map((item, index) => ({
    id: item.slug,
    name: item.name,
    slug: item.slug,
    website_url: "",
    icon: null,
    created_at: "",
    updated_at: "",
    section_software: {
      id: `ss-${item.slug}`,
      order: index,
      icon_override: null,
      status: "published" as const,
      created_at: "",
    },
  }));

  return { section, softwares };
}

export function adaptOffer(content: LandingPageContent) {
  const section = baseSection("offer", "offer", {
    title: content.offer.title,
    position: 4,
  });

  const offerFeatures = content.offer.features.map((f, index) => ({
    id: f.id,
    title: f.title,
    subtitle: f.subtitle,
    description: null,
    icon: f.icon,
    position: index,
    created_at: "",
    updated_at: "",
    section_feature: {
      id: `sf-${f.id}`,
      position: index,
      status: "published" as const,
      created_at: "",
    },
  }));

  return { section, offerFeatures };
}

export function adaptTimeline(content: LandingPageContent) {
  const section = baseSection("timeline", "timeline", {
    title: content.timeline.title,
    position: 5,
  });

  const timelineItems = content.timeline.steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    subtitle: step.subtitle,
    badge: step.badge,
    icon: step.icon,
    position: index,
    created_at: "",
    updated_at: "",
    section_timeline: {
      id: `st-${step.id}`,
      position: index,
      created_at: "",
    },
  }));

  return { section, timelineItems };
}

export function adaptFAQ(content: LandingPageContent) {
  const section = baseSection("faq", "faq", {
    title: content.faq.title,
    eyebrow: content.faq.eyebrow,
    position: 9,
  });

  const faqs = content.faq.faqs.map((faq, index) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    position: index,
  }));

  return { section, faqs };
}

export function adaptResults(content: LandingPageContent) {
  const section = baseSection("results", "results", {
    title: content.results.title,
    content: {
      primary: content.results.primary,
      secondary: content.results.secondary,
    },
    position: 10,
  });

  return { section };
}

export function adaptCTASection(content: LandingPageContent) {
  const section = baseSection("cta", "cta", {
    title: content.cta.title,
    eyebrow: content.cta.eyebrow,
    subtitle: content.cta.subtitle,
    ctaButtons: content.cta.ctas.map(adaptCTA),
    position: 11,
  });

  return { section, ctaButtons: section.ctaButtons };
}

export function adaptFooter(content: LandingPageContent) {
  const section = baseSection("footer", "footer", {
    title: content.footer.companyName,
    subtitle: content.footer.subtitle,
    position: 12,
  });

  const socialPlatforms = content.footer.socialPlatforms.map((p, index) => ({
    id: `sp-${p.name.toLowerCase()}`,
    name: p.name,
    icon: p.icon,
    base_url: p.url,
    created_at: "",
    updated_at: "",
    section_social: {
      id: `ss-${p.name.toLowerCase()}`,
      order: index,
      status: "published" as const,
      created_at: "",
    },
  }));

  return { section, socialPlatforms };
}

/**
 * Build sections array for Navbar (needs type + header_title for nav links)
 */
export function adaptSectionsForNavbar(content: LandingPageContent) {
  const sectionTypes = [
    { type: "header", title: "header" },
    { type: "hero", title: "hero" },
    { type: "logos", title: "logos" },
    { type: "offer", title: "offer" },
    { type: "timeline", title: "timeline" },
    { type: "faq", title: "faq" },
    { type: "results", title: "Benchmarks" },
    { type: "cta", title: "cta" },
    { type: "footer", title: "footer" },
  ];

  return sectionTypes.map((s, i) =>
    baseSection(s.type, s.type, {
      header_title: s.title,
      position: i,
    })
  );
}
