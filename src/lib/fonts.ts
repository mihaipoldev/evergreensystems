import {
  Roboto,
  Lato,
  Open_Sans,
  Montserrat,
  DM_Sans,
  Source_Code_Pro,
  Space_Grotesk,
  Josefin_Sans,
  Rubik,
  Inter,
  Poppins,
  Raleway,
  Nunito_Sans,
  Jost,
  Playfair_Display,
  Merriweather,
  Lora,
  EB_Garamond,
} from "next/font/google";
import type { FontId } from "@/types/fonts";

// Font Pairing 1: Roboto + Open Sans
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

// Font Pairing 2: Montserrat + DM Sans
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Font Pairing 3: Source Code Pro + Space Grotesk
export const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-code-pro",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Font Pairing 4: Josefin Sans + Rubik
export const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-josefin-sans",
  display: "swap",
});

export const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

// Font Pairing 5: Inter + Poppins
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Font Pairing 6: Raleway + Nunito Sans
export const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

export const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jost",
  display: "swap",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
  display: "swap",
});

export const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

export const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-eb-garamond",
  display: "swap",
});

// Default fonts (using Inter as default)
export const geistSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const geistMono = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Font registry mapping font IDs to font objects
export const fontRegistry: Record<FontId, { variable: string; className: string }> = {
  "roboto": { variable: "--font-roboto", className: roboto.variable },
  "lato": { variable: "--font-lato", className: lato.variable },
  "open-sans": { variable: "--font-open-sans", className: openSans.variable },
  "montserrat": { variable: "--font-montserrat", className: montserrat.variable },
  "dm-sans": { variable: "--font-dm-sans", className: dmSans.variable },
  "source-code-pro": { variable: "--font-source-code-pro", className: sourceCodePro.variable },
  "space-grotesk": { variable: "--font-space-grotesk", className: spaceGrotesk.variable },
  "josefin-sans": { variable: "--font-josefin-sans", className: josefinSans.variable },
  "rubik": { variable: "--font-rubik", className: rubik.variable },
  "inter": { variable: "--font-inter", className: inter.variable },
  "poppins": { variable: "--font-poppins", className: poppins.variable },
  "raleway": { variable: "--font-raleway", className: raleway.variable },
  "nunito-sans": { variable: "--font-nunito-sans", className: nunitoSans.variable },
  "jost": { variable: "--font-jost", className: jost.variable },
  "playfair-display": { variable: "--font-playfair-display", className: playfairDisplay.variable },
  "merriweather": { variable: "--font-merriweather", className: merriweather.variable },
  "lora": { variable: "--font-lora", className: lora.variable },
  "eb-garamond": { variable: "--font-eb-garamond", className: ebGaramond.variable },
  "gotham": { variable: "--font-gotham", className: "font-gotham" }, // Custom font, not from Google
  "geist-sans": { variable: "--font-geist-sans", className: geistSans.variable },
  "geist-mono": { variable: "--font-geist-mono", className: geistMono.variable },
};

// Font options for UI selection
export const fontOptions = [
  { id: "roboto" as FontId, label: "Roboto" },
  { id: "lato" as FontId, label: "Lato" },
  { id: "open-sans" as FontId, label: "Open Sans" },
  { id: "montserrat" as FontId, label: "Montserrat" },
  { id: "dm-sans" as FontId, label: "DM Sans" },
  { id: "source-code-pro" as FontId, label: "Source Code Pro" },
  { id: "space-grotesk" as FontId, label: "Space Grotesk" },
  { id: "josefin-sans" as FontId, label: "Josefin Sans" },
  { id: "rubik" as FontId, label: "Rubik" },
  { id: "inter" as FontId, label: "Inter" },
  { id: "poppins" as FontId, label: "Poppins" },
  { id: "raleway" as FontId, label: "Raleway" },
  { id: "nunito-sans" as FontId, label: "Nunito Sans" },
  { id: "jost" as FontId, label: "Jost" },
  { id: "playfair-display" as FontId, label: "Playfair Display" },
  { id: "merriweather" as FontId, label: "Merriweather" },
  { id: "lora" as FontId, label: "Lora" },
  { id: "eb-garamond" as FontId, label: "EB Garamond" },
  { id: "gotham" as FontId, label: "Gotham" },
  { id: "geist-sans" as FontId, label: "Geist Sans" },
  { id: "geist-mono" as FontId, label: "Geist Mono" },
];

/**
 * Get all font variable classes as a space-separated string
 * Used to add all fonts to the HTML element
 */
export function getAllFontVariables(): string {
  return Object.values(fontRegistry)
    .map((font) => font.className)
    .join(" ");
}

/**
 * Get font variable classes for only the selected fonts
 * Returns a space-separated string of font classes needed
 * @param fontIds - Array of font IDs to load
 * @returns Space-separated string of font CSS variable classes
 */
export function getSelectedFontVariables(fontIds: FontId[]): string {
  const uniqueFontIds = [...new Set(fontIds)]; // Remove duplicates
  return uniqueFontIds
    .map((fontId) => {
      const font = fontRegistry[fontId];
      return font?.className || fontRegistry["geist-sans"].className;
    })
    .filter(Boolean) // Remove any null/undefined values
    .join(" ");
}

/**
 * Get the CSS variable name for a font ID
 */
export function getFontVariable(fontId: FontId): string {
  return fontRegistry[fontId]?.variable || fontRegistry["geist-sans"].variable;
}

/**
 * Get the CSS font-family value for a font ID
 */
export function getFontFamilyCSS(fontId: FontId): string {
  const variable = getFontVariable(fontId);
  return `var(${variable}), system-ui, sans-serif`;
}

