// The one switch for unfinished surfaces: draft blog posts, the capture forms
// (no backend yet), /contact, /book. In dev everything renders (with draft
// markers) so work continues; in production these surfaces hide (404 / not
// rendered) until they're real. NEXT_PUBLIC_SHOW_DRAFTS=1 forces them visible
// on a Vercel preview when needed.
export const SHOW_DRAFTS =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_SHOW_DRAFTS === "1";
