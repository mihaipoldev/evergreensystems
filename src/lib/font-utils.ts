import type { FontConfig } from "@/types/fonts";
import { DEFAULT_FONT_CONFIG } from "@/types/fonts";
import { getFontVariable as getFontVariableLightweight } from "./font-variables";

/**
 * Parse font_family JSON string from database
 */
export function parseFontFamily(fontFamilyJson: string | null | undefined): FontConfig {
  if (!fontFamilyJson) {
    return DEFAULT_FONT_CONFIG;
  }

  try {
    const parsed = JSON.parse(fontFamilyJson);
    
    // Validate structure - must have admin, landing is optional
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.admin === "object" &&
      typeof parsed.admin?.heading === "string" &&
      typeof parsed.admin?.body === "string"
    ) {
      const config: FontConfig = {
        admin: parsed.admin,
      };
      
      // Include landing fonts if present
      if (
        typeof parsed.landing === "object" &&
        parsed.landing !== null &&
        typeof parsed.landing.heading === "string" &&
        typeof parsed.landing.body === "string"
      ) {
        config.landing = parsed.landing;
      }
      
      return config;
    }
  } catch (error) {
    console.error("Error parsing font_family JSON:", error);
  }

  return DEFAULT_FONT_CONFIG;
}

/**
 * Serialize FontConfig to JSON string for database storage
 */
export function serializeFontFamily(fonts: FontConfig): string {
  return JSON.stringify(fonts);
}

/**
 * Get default font configuration
 */
export function getDefaultFontFamily(): FontConfig {
  return DEFAULT_FONT_CONFIG;
}

/**
 * Generate complete CSS for admin fonts
 * Only applies to .preset-admin, not :root to avoid affecting landing page
 */
export function generateFontCSS(fonts: FontConfig): string {
  const headingVar = getFontVariableLightweight(fonts.admin.heading);
  const bodyVar = getFontVariableLightweight(fonts.admin.body);

  // Only set CSS variables on .preset-admin, not :root
  // This prevents website fonts from affecting admin panel
  return `.preset-admin,.preset-admin *{--font-family-admin-heading:var(${headingVar});--font-family-admin-body:var(${bodyVar});}html.preset-admin body,html.preset-admin body *,.preset-admin body,.preset-admin body *{font-family:var(${bodyVar}),system-ui,sans-serif!important;}html.preset-admin body h1,html.preset-admin body h2,html.preset-admin body h3,html.preset-admin body h4,html.preset-admin body h5,html.preset-admin body h6,.preset-admin h1,.preset-admin h2,.preset-admin h3,.preset-admin h4,.preset-admin h5,.preset-admin h6{font-family:var(${headingVar}),system-ui,sans-serif!important;}`;
}

/**
 * Generate complete CSS for landing page fonts
 * Only applies to .preset-landing-page, not :root to avoid affecting admin panel
 */
export function generateLandingFontCSS(fonts: FontConfig): string {
  if (!fonts.landing) {
    return "";
  }
  
  const headingVar = getFontVariableLightweight(fonts.landing.heading);
  const bodyVar = getFontVariableLightweight(fonts.landing.body);

  // Only set CSS variables on .preset-landing-page, not :root
  // This prevents landing page fonts from affecting admin panel
  return `.preset-landing-page,.preset-landing-page *{--font-family-public-heading:var(${headingVar});--font-family-public-body:var(${bodyVar});}html.preset-landing-page body,html.preset-landing-page body *,.preset-landing-page body,.preset-landing-page body *{font-family:var(${bodyVar}),system-ui,sans-serif!important;}html.preset-landing-page body h1,html.preset-landing-page body h2,html.preset-landing-page body h3,html.preset-landing-page body h4,html.preset-landing-page body h5,html.preset-landing-page body h6,.preset-landing-page h1,.preset-landing-page h2,.preset-landing-page h3,.preset-landing-page h4,.preset-landing-page h5,.preset-landing-page h6{font-family:var(${headingVar}),system-ui,sans-serif!important;}`;
}

