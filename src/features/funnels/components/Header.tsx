"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { trackEvent } from "@/lib/analytics";
import type { HeaderContent } from "../types";
import { Logo } from "@/components/shared/Logo";

const SCROLL_THRESHOLD = 12;

interface HeaderProps {
  content: HeaderContent;
}

const Header = ({ content }: HeaderProps) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isFunnelPage = pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    handleScroll(); // initial check (e.g. load with hash)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to handle smooth scroll for anchor links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerHeight = 100;
      const offset = 20;
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed md:top-8 top-0 left-0 right-0 z-50 w-full md:px-4 md:px-8">
      <div className="w-full md:max-w-2xl md:mx-auto">
        <nav
          className={`bg-background/70 backdrop-blur-lg rounded-none md:rounded-full p-3 md:p-2 flex items-center justify-between gap-6 transition-shadow duration-200 ${
            isScrolled ? "md:shadow-sm" : "md:shadow-none"
          }`}
        >
          {/* Logo: full page load when on funnel so landing preset (colors/fonts) loads correctly */}
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

          {/* Navigation Links */}
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

          {/* CTA Button */}
          <div className="flex-shrink-0 md:mr-0 mr-3">
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
