import type { FontId } from "@/types/fonts";

/**
 * Lightweight font variable mapping for middleware use.
 * This avoids importing the actual font loaders which would bloat the middleware bundle.
 */
const fontVariableMap: Record<FontId, string> = {
  "roboto": "--font-roboto",
  "lato": "--font-lato",
  "open-sans": "--font-open-sans",
  "montserrat": "--font-montserrat",
  "dm-sans": "--font-dm-sans",
  "source-code-pro": "--font-source-code-pro",
  "space-grotesk": "--font-space-grotesk",
  "josefin-sans": "--font-josefin-sans",
  "rubik": "--font-rubik",
  "inter": "--font-inter",
  "poppins": "--font-poppins",
  "raleway": "--font-raleway",
  "nunito-sans": "--font-nunito-sans",
  "jost": "--font-jost",
  "playfair-display": "--font-playfair-display",
  "merriweather": "--font-merriweather",
  "lora": "--font-lora",
  "eb-garamond": "--font-eb-garamond",
  "gotham": "--font-gotham",
  "geist-sans": "--font-geist-sans",
  "geist-mono": "--font-geist-mono",
};

/**
 * Get the CSS variable name for a font ID (lightweight version for middleware)
 */
export function getFontVariable(fontId: FontId): string {
  return fontVariableMap[fontId] || fontVariableMap["geist-sans"];
}

