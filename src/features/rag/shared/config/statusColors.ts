// Status color mapping - define which color each status uses
// This is the single source of truth for status colors
// ProjectRunsClient can override this if needed
export const statusColorMap: Record<string, string> = {
  // Run statuses
  queued: "muted",
  collecting: "yellow-600",
  ingesting: "blue-600",
  generating: "purple-600",
  complete: "green-600",
  failed: "red-600",
  // Project statuses
  active: "green-600",
  draft: "muted",
  archived: "muted",
  delivered: "blue-600",
  onboarding: "yellow-600",
  // Document statuses
  ready: "green-600",
  processing: "yellow-600",
  // Project type and workflow statuses
  enabled: "green-600",
  disabled: "muted",
};

