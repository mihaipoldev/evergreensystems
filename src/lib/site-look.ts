import type { FontId } from "@/types/fonts";
import { getFunnelPresetClass } from "@/features/funnels/routes";

/**
 * The site's look, per route, in code (POR-608). A page's theme, its two fonts and its two brand
 * colours were read on every request from `public.website_settings` (route × environment → preset)
 * and `public.website_settings_presets`; they are written here as the production rows held them on
 * 2026-10-02, and those rows are no longer read. A change of look is a change to this file,
 * deployed like any other.
 *
 * Keys are the routes `getRouteForPathname` returns: `/` for every page that is not a funnel, and
 * `/<routePath>` for each funnel. Every environment renders this look: a local `next dev` shows
 * what production shows (the development rows were the old editors' sandbox).
 */

export type Hsl = { h: number; s: number; l: number };

export type SiteLook = {
  /** The preset the look was copied from (`website_settings_presets.name`), for the record. */
  preset: string;
  /** The theme next-themes forces on the page. */
  theme: "light" | "dark";
  /** The public pages' heading and body fonts, loaded by the root layout. */
  fonts: { heading: FontId; body: FontId };
  /** `--brand-h/s/l` and `--primary` on the page's preset class (`siteColorCss`). */
  primary: Hsl;
  /** `--secondary` on the page's preset class (`siteColorCss`). */
  secondary: Hsl;
  /** The `/legacy` landing page's background effects. */
  styling: { dots: boolean; waveGradient: boolean; noiseTexture: boolean };
};

const MIDNIGHT_EMBER: SiteLook = {
  preset: "Midnight Ember",
  theme: "light",
  fonts: { heading: "lato", body: "rubik" },
  primary: { h: 213, s: 68, l: 15 },
  secondary: { h: 26, s: 70, l: 51 },
  styling: { dots: false, waveGradient: true, noiseTexture: true },
};

const GREEN_DARK_V2: SiteLook = {
  preset: "GreenDark v2",
  theme: "dark",
  fonts: { heading: "nunito-sans", body: "lato" },
  primary: { h: 165, s: 100, l: 30 },
  secondary: { h: 165, s: 72, l: 25 },
  styling: { dots: false, waveGradient: false, noiseTexture: true },
};

export const SITE_LOOKS: Readonly<Record<string, SiteLook>> = {
  "/": MIDNIGHT_EMBER,
  "/outbound-system": GREEN_DARK_V2,
  "/for/commercial-cleaning": MIDNIGHT_EMBER,
  "/for/commercial-hvac": MIDNIGHT_EMBER,
  "/for/recruiting-agencies": MIDNIGHT_EMBER,
};

/**
 * The look of a route, or null for a route that has none. A route without a look renders as a
 * route without a row did: the default fonts only, the dark theme, no colour rule. A new funnel
 * gets its entry here.
 */
export function siteLookForRoute(route: string): SiteLook | null {
  return SITE_LOOKS[route] ?? null;
}

/**
 * The brand-colour rule the root layout injects: on the preset class the pathname wears
 * (`getFunnelPresetClass`), every element under it and its dark variant, the look's primary and
 * secondary override the class's own `--primary` and `--secondary` from globals.css.
 */
export function siteColorCss(look: SiteLook, pathname: string): string {
  const { primary, secondary } = look;
  const presetClass = getFunnelPresetClass(pathname);
  const declarations =
    `--brand-h:${primary.h}!important;--brand-s:${primary.s}!important;--brand-l:${primary.l}!important;` +
    `--primary:${primary.h} ${primary.s}% ${primary.l}%!important;` +
    `--secondary:${secondary.h} ${secondary.s}% ${secondary.l}%!important;`;
  return `.${presetClass},.${presetClass} *,.${presetClass}.dark,.${presetClass}.dark *{${declarations}}`;
}
