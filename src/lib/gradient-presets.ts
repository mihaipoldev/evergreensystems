/**
 * Returns the sidebar gradient classes
 */
export function getSidebarGradient(): string {
  return "bg-gradient-to-b from-sidebar-background to-sidebar-background/80";
}

/**
 * Returns the sidebar accent gradient classes for active items
 */
export function getSidebarAccentGradient(): string {
  return "bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10";
}

/**
 * Returns the card gradient classes for dashboard cards
 */
export function getCardGradient(): string {
  return "bg-gradient-to-br from-card/80 via-card/60 to-card/40";
}
