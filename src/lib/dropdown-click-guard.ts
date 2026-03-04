import type { MouseEvent } from "react";

/**
 * Guards against row navigation when the user clicks inside a portaled dropdown.
 * Radix dropdown content is rendered in a portal, so when the menu closes on item
 * click the click can be delivered to the element now under the cursor (the row).
 * We mark pointer-down on dropdown content and ignore the subsequent click on the row.
 */

const WINDOW_MS = 400;
let lastPointerDownAt = 0;

export function markClickFromDropdown(): void {
  lastPointerDownAt = Date.now();
}

export function wasClickFromDropdown(): boolean {
  const now = Date.now();
  const recent = now - lastPointerDownAt <= WINDOW_MS;
  if (recent) {
    lastPointerDownAt = 0;
  }
  return recent;
}

export function shouldIgnoreRowClick(e: MouseEvent): boolean {
  const target = e.target as HTMLElement;
  if (target.closest("[data-action-menu]")) {
    return true;
  }
  if (wasClickFromDropdown()) {
    return true;
  }
  return false;
}
