"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { HeaderContent } from "../types";
import { Logo } from "@/components/shared/Logo";
import { MobileNavMenu, type MobileCTA } from "@/components/landing/MobileNavMenu";

const SCROLL_THRESHOLD = 12;

interface HeaderProps {
  content: HeaderContent;
}

const Header = ({ content }: HeaderProps) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isFunnelPage = pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // iOS-safe body scroll lock + Escape to close while menu is open
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  // Smooth scroll for desktop anchor clicks
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = 100;
      const offset = 20;
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - offset;
      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: "smooth" });
    }
  };

  // Close mobile menu, then scroll on next paint after the lock cleanup
  // restores the page (otherwise the cleanup undoes our scrollTo).
  const handleMobileLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isAnchor: boolean,
  ) => {
    if (!isAnchor) {
      setIsOpen(false);
      return;
    }
    e.preventDefault();
    setIsOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        const targetId = href.replace("#", "");
        const section = document.getElementById(targetId);
        if (!section) return;
        const heading =
          section.querySelector<HTMLElement>("h1, h2, h3") ?? section;
        const mobileHeaderClearance = 64;
        const elementPosition =
          heading.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - mobileHeaderClearance;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      });
    });
  };

  // Adapt funnel nav links + single CTA into the shared MobileNavMenu shape
  const mobileNavLinks = useMemo(
    () =>
      content.navLinks.map((link) => ({
        name: link.label,
        href: link.href,
        sectionId: link.href.replace("#", ""),
      })),
    [content.navLinks],
  );

  const mobileCtaButtons = useMemo<MobileCTA[]>(
    () =>
      content.ctaUrl
        ? [
            {
              id: content.ctaId ?? "funnel-header-cta",
              label: content.ctaButtonText,
              url: content.ctaUrl,
              icon: faCalendar,
              style: "primary",
            },
          ]
        : [],
    [content.ctaButtonText, content.ctaUrl, content.ctaId],
  );

  return (
    <>
    <header className="fixed md:top-8 top-0 left-0 right-0 z-50 w-full md:px-4 md:px-8">
      <div className="w-full md:max-w-2xl md:mx-auto">
        <nav
          className={`bg-background/70 backdrop-blur-lg rounded-none md:rounded-full p-3 md:p-2 flex items-center justify-between gap-6 transition-shadow duration-200 ${
            isScrolled ? "md:shadow-sm" : "md:shadow-none"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isFunnelPage ? (
              <a href="/" className="ml-3 flex items-center">
                <Logo variant="horizontal" className="h-6 md:h-8" usePrimaryColor={true} />
              </a>
            ) : (
              <Link href="/" className="ml-3 flex items-center">
                <Logo variant="horizontal" className="h-6 md:h-8" usePrimaryColor={true} />
              </Link>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
            {content.navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm transition-colors whitespace-nowrap cursor-pointer text-muted-foreground font-normal"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              className="rounded-full border-gray-300 flex items-center gap-2"
              asChild
            >
              <Link
                href={content.ctaUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (content.ctaId) {
                    trackEvent({
                      event_type: "link_click",
                      entity_type: "cta_button",
                      entity_id: content.ctaId,
                      metadata: { location: "funnel_header" },
                    });
                  }
                }}
              >
                <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
                <span className="text-sm font-medium">{content.ctaButtonText}</span>
              </Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex-shrink-0 md:hidden mr-3">
            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-panel"
              className="relative h-10 w-10 flex items-center justify-center active:scale-95 transition-transform text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {isOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>
    </header>

    {/* Mobile full-screen menu — sibling so the header (z-50) always paints on top */}
    <AnimatePresence>
      {isOpen && (
        <MobileNavMenu
          navLinks={mobileNavLinks}
          activeSection=""
          ctaButtons={mobileCtaButtons}
          onMobileLinkClick={handleMobileLinkClick}
        />
      )}
    </AnimatePresence>
    </>
  );
};

export default Header;
