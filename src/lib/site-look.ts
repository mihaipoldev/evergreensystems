import type { FontId } from "@/types/fonts";
import { getFunnelPresetClass } from "@/features/funnels/routes";

/**
 * The site's one look (POR-608; Mihai, 2026-10-02): every public page wears the landing page's
 * palette and fonts, the values `src/styles/home.css` gives `.eg-home` — light, Inter, ink navy
 * `#0C2340`, accent terracotta `#D4742C`. No page has a look of its own. A change of look is a change
 * here and in home.css (and the `.preset-landing-page` tokens in globals.css), deployed like any
 * other; nothing is read from the database.
 */

export type Hsl = { h: number; s: number; l: number };

export type SiteLook = {
  /** The theme next-themes forces on every public page. */
  theme: "light" | "dark";
  /** The public pages' heading and body fonts, loaded by the root layout. */
  fonts: { heading: FontId; body: FontId };
  /** `--brand-h/s/l` and `--primary` on the preset class (`siteColorCss`). */
  primary: Hsl;
  /** `--secondary` on the preset class (`siteColorCss`). */
  secondary: Hsl;
  /** The `/legacy` page's background effects: none, like every other page. */
  styling: { dots: boolean; waveGradient: boolean; noiseTexture: boolean };
};

export const SITE_LOOK: SiteLook = {
  theme: "light",
  fonts: { heading: "inter", body: "inter" },
  primary: { h: 213, s: 68, l: 15 }, // #0C2340, home.css --ink / --panel
  secondary: { h: 26, s: 66, l: 50 }, // #D4742C, home.css --accent
  styling: { dots: false, waveGradient: false, noiseTexture: false },
};

/** The look of a route: the one look, whatever the route. */
export function siteLookForRoute(_route: string): SiteLook {
  return SITE_LOOK;
}

/**
 * The brand-colour rule the root layout injects: on the preset class every public page wears
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
