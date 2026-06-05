import { home } from "@/features/home/content";

// Sticky top nav. Anchor links scroll in-page (CSS scroll-behavior:smooth on
// the .eg-home subtree). No interactivity → server component. On mobile the
// links collapse (matching the prototype) and only the CTA stays.
export function Navbar() {
  const { nav } = home;
  return (
    <header className="nav">
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
        <a href={nav.cta.href} className="btn btn-solid btn-sm">
          {nav.cta.label}
        </a>
      </div>
    </header>
  );
}
