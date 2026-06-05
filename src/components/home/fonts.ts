// Fonts for the new homepage (the Claude Design system uses Inter / Space
// Grotesk / JetBrains Mono). Loaded via next/font and exposed as the CSS
// variables that src/styles/home.css references on `.eg-home`.
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";

export const egHead = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-eg-head",
  display: "swap",
});

export const egAlt = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-eg-alt",
  display: "swap",
});

export const egMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-eg-mono",
  display: "swap",
});

/** className string to drop on the `.eg-home` wrapper element. */
export const egFontVars = `${egHead.variable} ${egAlt.variable} ${egMono.variable}`;
