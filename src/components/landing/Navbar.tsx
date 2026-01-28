"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { CTAButtonWithSection } from '@/features/page-builder/cta/types';
import { MobileNavMenu } from './MobileNavMenu';

type Section = {
  id: string;
  type: string;
  title: string | null;
  admin_title: string | null;
  header_title: string | null;
  subtitle: string | null;
  content: any | null;
  media_url: string | null;
  page_section_id: string;
  position: number;
  status: "published" | "draft" | "deactivated";
  ctaButtons?: CTAButtonWithSection[];
};

type NavbarProps = {
  sections?: Section[];
  headerSection?: Section;
};

// Helper function to convert string to title case
const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format section type to display name
const formatSectionName = (type: string, headerTitle: string | null): string => {
  // Use header_title if available, otherwise format the type
  if (headerTitle && headerTitle.trim()) {
    return toTitleCase(headerTitle.trim());
  }
  
  // Format type: "testimonials" -> "Testimonials", "faq" -> "FAQ"
  const typeMap: Record<string, string> = {
    'logos': 'Logos',
    'stories': 'Stories',
    'features': 'Services',
    'offer': 'Offer',
    'testimonials': 'Testimonials',
    'results': 'Results',
    'performance': 'Performance',
    'faq': 'FAQ',
    'timeline': 'Timeline',
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to get anchor href from section type
const getSectionHref = (type: string): string => {
  // Special case: features type uses "services" as anchor
  if (type === 'features') return '#services';
  if (type === 'offer') return '#offer';
  if (type === 'performance') return '#performance';
  return `#${type}`;
};

export const Navbar = ({ sections = [], headerSection }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const isMobile = useIsMobile();
  const lastScrollYRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Safety check for client-side only
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 10;
      setScrolled(isScrolled);

      // Hide/show header on mobile only
      if (isMobile) {
        // Show header when at top
        if (currentScrollY < 10) {
          setIsVisible(true);
        } else {
          // Hide when scrolling down, show when scrolling up
          if (currentScrollY > lastScrollYRef.current && currentScrollY > 30) {
            // Scrolling down and past 30px - hide
            setIsVisible(false);
          } else if (currentScrollY < lastScrollYRef.current) {
            // Scrolling up - show
            setIsVisible(true);
          }
        }
        lastScrollYRef.current = currentScrollY;
      } else {
        // Always visible on desktop
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Smooth scroll handler for navigation links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Safety check for client-side only
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerHeight = 100;
      const offset = 20;
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      // Reduce offset slightly to ensure we land within the activation zone
      const offsetPosition = elementPosition - headerHeight - offset - 30;
      
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  // Get header section CTA buttons
  const headerButtons = useMemo(() => {
    if (!headerSection?.ctaButtons || headerSection.ctaButtons.length === 0) {
      return [];
    }
    return [...headerSection.ctaButtons].sort((a, b) => 
      a.section_cta_button.position - b.section_cta_button.position
    );
  }, [headerSection]);

  // Generate navigation links from sections, excluding hero, cta, logos, header, and footer
  // In production: only show published sections
  // In development: show both published and draft sections
  // Sections are already ordered by position from the database, but we sort again to ensure correct order
  const navLinks = useMemo(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return sections
      .filter((section) => {
        // Exclude special section types
        if (['hero', 'cta', 'logos', 'header', 'footer'].includes(section.type)) {
          return false;
        }
        
        // Filter by status based on environment
        if (isDevelopment) {
          return section.status === 'published' || section.status === 'draft';
        } else {
          return section.status === 'published';
        }
      })
      .sort((a, b) => {
        // Handle null/undefined positions by putting them at the end
        const aPos = a.position ?? Infinity;
        const bPos = b.position ?? Infinity;
        // Primary sort by position
        if (aPos !== bPos) {
          return aPos - bPos;
        }
        // Secondary sort by id for stability when positions are equal
        return a.id.localeCompare(b.id);
      })
      .map((section) => ({
        name: formatSectionName(section.type, section.header_title),
        href: getSectionHref(section.type),
        sectionId: getSectionHref(section.type).replace('#', ''), // Remove # for ID
      }));
  }, [sections]);

  // Scroll detection to highlight active section
  useEffect(() => {
    // Safety check for client-side only
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // Get the first section element to check if we're above it
    const firstSection = navLinks[0];
    const firstElement = firstSection ? document.getElementById(firstSection.sectionId) : null;
    const heroOffset = firstElement ? firstElement.offsetTop - 300 : 400; // Account for hero section

    // Handle scroll to update active section
    const handleScroll = () => {
      // Double-check window is available
      if (typeof window === "undefined") {
        return;
      }

      const scrollY = window.scrollY;
      
      // Check if CTA section is in view
      const ctaElement = document.getElementById('cta');
      if (ctaElement) {
        const { offsetTop, offsetHeight } = ctaElement;
        const ctaTop = offsetTop - 200;
        const ctaBottom = offsetTop + offsetHeight - 100;
        
        if (scrollY >= ctaTop && scrollY < ctaBottom) {
          setActiveSection('cta');
          return;
        }
      }
      
      // Clear active section if we're at the top (before first section)
      if (scrollY < heroOffset) {
        setActiveSection('');
        return;
      }

      // Find which section is currently in view
      let activeId = '';
      for (const link of navLinks) {
        const element = document.getElementById(link.sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          const sectionTop = offsetTop - 150; // Match scroll offset (100 header + 20 padding + 30 adjustment)
          const sectionBottom = offsetTop + offsetHeight - 100;
          
          // Section is active if scroll position is within its bounds
          if (scrollY >= sectionTop && scrollY < sectionBottom) {
            activeId = link.sectionId;
            break;
          }
        }
      }
      
      if (activeId) {
        setActiveSection(activeId);
      } else {
        // If no section matches, clear active
        setActiveSection('');
      }
    };

    // Initial check with delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 150);
    
    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
      window.removeEventListener('scroll', throttledHandleScroll);
      }
    };
  }, [navLinks]);

  return (
    <motion.nav
      initial={false}
      animate={{ 
        y: isMobile && !isVisible ? -100 : 0, 
        opacity: 1 
      }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="fixed md:top-8 top-0 left-0 right-0 z-50 w-full md:px-4 md:px-8"
    >
      <div className="w-full md:max-w-2xl md:mx-auto">
        <div className={`rounded-none md:rounded-full p-3 md:p-2 flex items-center justify-between gap-6 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-lg md:shadow-sm' 
            : 'bg-transparent backdrop-blur-0 border-b-0 md:border-0'
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/"
              className="ml-3 text-lg font-bold text-primary"
            >
              Evergreen Sys.
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`nav-link-no-shift text-sm transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-foreground font-bold"
                      : "text-muted-foreground font-normal"
                  }`}
                  data-text={link.name}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Header Section CTA Buttons */}
          {headerButtons.length > 0 && (
            <div className="hidden md:flex flex-shrink-0">
              {headerButtons.map((button) => {
                const isAnchorLink = button.url.startsWith('#');
                return (
                  <Button 
                    key={button.id}
                    asChild
                    variant="default"
                    size="sm"
                    className={cn(
                      "rounded-full border-gray-300 flex items-center gap-2",
                      button.style === "primary" || !button.style
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : button.style === "secondary"
                        ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <Link 
                      href={button.url}
                      {...(isAnchorLink ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      onClick={(e) => {
                        if (isAnchorLink) {
                          handleSmoothScroll(e, button.url);
                        }
                        trackEvent({
                          event_type: "link_click",
                          entity_type: "cta_button",
                          entity_id: button.id,
                          metadata: {
                            location: "navbar",
                            href: button.url,
                            label: button.label,
                          },
                        });
                      }}
                    >
                      {button.icon && (
                        <FontAwesomeIcon
                          icon={button.icon as any}
                          className="h-4 w-4"
                        />
                      )}
                      <span className="text-sm font-medium">{button.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex-shrink-0 md:hidden flex items-center gap-2">
            <button
              className="text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <MobileNavMenu
            navLinks={navLinks}
            activeSection={activeSection}
            headerButtons={headerButtons}
            handleSmoothScroll={handleSmoothScroll}
            onLinkClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </motion.nav>
  );
};

