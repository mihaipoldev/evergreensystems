import type { ReactNode } from "react";

// Tracked CTA link. Carries the data-analytics-* contract; the global
// SiteAnalytics tracker fires the `link_click` / `cta_button` event on click
// (keepalive fetch survives navigation) and the impression observer uses the
// same attributes to record visibility for view→click CTR.
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
      data-analytics-type="cta_button"
      data-analytics-id={entityId}
      data-analytics-label={label}
      data-analytics-section={location}
    >
      {children}
    </a>
  );
}
