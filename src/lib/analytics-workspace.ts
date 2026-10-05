// This site only ever serves the Evergreen workspace. `analytics_events` is shared with
// mihaipol.com (which writes the artist workspace), so every read, delete and insert here is
// scoped to Evergreen's id — hardcoded to avoid env/deploy drift.
export const EVERGREEN_WORKSPACE_ID = "8005d256-daa4-434b-b473-56b32f79f7ad";
