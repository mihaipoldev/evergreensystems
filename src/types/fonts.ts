export type FontId =
  | "roboto"
  | "lato"
  | "open-sans"
  | "montserrat"
  | "dm-sans"
  | "source-code-pro"
  | "space-grotesk"
  | "josefin-sans"
  | "rubik"
  | "inter"
  | "poppins"
  | "raleway"
  | "nunito-sans"
  | "jost"
  | "playfair-display"
  | "merriweather"
  | "lora"
  | "eb-garamond"
  | "gotham"
  | "geist-sans"
  | "geist-mono";

export interface FontConfig {
  admin: {
    heading: FontId;
    body: FontId;
  };
  landing?: {
    heading: FontId;
    body: FontId;
  };
}

export interface FontOption {
  id: FontId;
  label: string;
  variable: string;
}

export const DEFAULT_FONT_CONFIG: FontConfig = {
  admin: {
    heading: "geist-sans",
    body: "geist-sans",
  },
  landing: {
    heading: "gotham",
    body: "gotham",
  },
};

