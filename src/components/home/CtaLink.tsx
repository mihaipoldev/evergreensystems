"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

// Tracked CTA link. Fires a `link_click` / `cta_button` analytics event (matching
// the old landing page's CTA tracking) then lets the <a> navigate normally —
// trackEvent uses keepalive for link clicks, so the event survives navigation.
export function CtaLink({
  href,
  entityId,
  label,
  location,
  className,
  children,
}: {
  href: string;
  entityId: string;
  label: string;
  location: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackEvent({
          event_type: "link_click",
          entity_type: "cta_button",
          entity_id: entityId,
          metadata: { location, href, label },
        });
      }}
    >
      {children}
    </a>
  );
}
