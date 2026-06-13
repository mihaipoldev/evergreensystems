"use client";

import { home } from "@/features/home/content";
import { CtaLink } from "./CtaLink";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";

// Sticky top nav. Anchor links scroll in-page (CSS scroll-behavior:smooth on
// the .eg-home subtree). On mobile the links collapse (matching the prototype)
// and only the CTA stays; the bar also hides on scroll-down / reveals on
// scroll-up via useHideOnScroll (mobile only).
export function Navbar() {
  const { nav } = home;
  const hidden = useHideOnScroll();
  return (
    <header className={`nav${hidden ? " is-hidden" : ""}`}>
      <div className="wrap">
        <a className="brand" href="#top" aria-label={nav.brandAlt}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={nav.brandLogo} alt={nav.brandAlt} />
        </a>
        <nav className="nav-links">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <CtaLink
          href={nav.cta.href}
          entityId={nav.cta.id}
          label={nav.cta.label}
          location="navbar"
          className="btn btn-solid btn-sm"
        >
          {nav.cta.label}
        </CtaLink>
      </div>
    </header>
  );
}
