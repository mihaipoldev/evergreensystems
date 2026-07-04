"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { home } from "@/features/home/content";
import { CtaLink } from "./CtaLink";
import { Icon } from "./icons";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";

// Sticky top nav. Anchor links scroll in-page; the "Resources" item opens the
// v3 popover (icon-tile menu, right-aligned) — toggled by an `is-open` class
// on hover AND click, and closed on Escape / outside-click. The whole nav-links
// row (dropdown included) is hidden on mobile. The bar hides on scroll-down /
// reveals on scroll-up on mobile, and shrinks + elevates once the page scrolls.
export function Navbar() {
  const { nav } = home;
  const hidden = useHideOnScroll();
  const [scrolled, setScrolled] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Resources popover: close on Escape or a click/tap outside it.
  useEffect(() => {
    if (!resOpen) return;
    function onDocPointer(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setResOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setResOpen(false);
    }
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [resOpen]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const openRes = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setResOpen(true);
  };
  const closeResSoon = () => {
    closeTimer.current = setTimeout(() => setResOpen(false), 120);
  };

  return (
    <header className={`nav${hidden ? " is-hidden" : ""}${scrolled ? " is-scrolled" : ""}`}>
      <div className="wrap">
        <Link className="brand" href="/" aria-label={nav.brandAlt}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={nav.brandLogo} alt={nav.brandAlt} />
        </Link>
        <nav className="nav-links">
          {nav.links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}

          <div
            className={`nav-drop${resOpen ? " is-open" : ""}`}
            ref={dropRef}
            onMouseEnter={openRes}
            onMouseLeave={closeResSoon}
          >
            <button
              type="button"
              className="nav-drop-trigger"
              aria-haspopup="true"
              aria-expanded={resOpen}
              data-analytics-skip="true"
              onClick={() => setResOpen((o) => !o)}
            >
              {nav.resources.label} <ChevronDown aria-hidden="true" />
            </button>
            <div className="nav-menu" role="menu">
              {nav.resources.items.map((item) =>
                item.soon ? (
                  <div className="nav-menu-item is-soon" key={item.id}>
                    <span className="nmi-ic">
                      <Icon name={item.icon} />
                    </span>
                    <span className="nmi-txt">
                      <b>
                        {item.title} <span className="nmi-tag">Soon</span>
                      </b>
                      <span>{item.desc}</span>
                    </span>
                  </div>
                ) : (
                  <a
                    className="nav-menu-item"
                    href={item.href}
                    key={item.id}
                    role="menuitem"
                    data-analytics-id={item.id}
                    onClick={() => setResOpen(false)}
                  >
                    <span className="nmi-ic">
                      <Icon name={item.icon} />
                    </span>
                    <span className="nmi-txt">
                      <b>{item.title}</b>
                      <span>{item.desc}</span>
                    </span>
                  </a>
                ),
              )}
              <div className="nav-menu-foot">
                <a
                  href={nav.resources.foot.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-type="cta_button"
                  data-analytics-id={nav.resources.foot.id}
                  data-analytics-label={nav.resources.foot.linkLabel}
                  onClick={() => setResOpen(false)}
                >
                  <span>{nav.resources.foot.text}</span>
                  {nav.resources.foot.linkLabel} <ArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
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
