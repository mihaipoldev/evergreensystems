"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
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

  const navLinks = [
    { label: "Outcomes", href: "#expected-outcomes", active: false },
    { label: "Why", href: "#why-outbound", active: false },
    { label: "Deliverables", href: "#what-you-get", active: false },
    { label: "Pricing", href: "#pricing", active: false },
  ];

  return (
    <header className="fixed md:top-8 top-6 left-0 right-0 z-50 w-full px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <nav className="bg-white/30 backdrop-blur-md rounded-full p-2 shadow-sm border border-white/20 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="ml-3 text-lg font-bold text-primary">
              Evergreen Sys.
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className={`text-sm transition-colors whitespace-nowrap cursor-pointer ${
                  link.active
                    ? "text-foreground font-bold"
                    : "text-muted-foreground font-normal"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              className="rounded-full border-gray-300 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
              <span className="text-sm font-medium">Book Call</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
