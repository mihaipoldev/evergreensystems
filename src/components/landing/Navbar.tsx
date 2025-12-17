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
import type { CTAButtonWithSection } from '@/features/cta/types';

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
      const navbarHeight = 80; // Height of the navbar
      const offset = 20; // Additional offset for better spacing
      const targetPosition = targetElement.offsetTop - navbarHeight - offset;
      
      window.scrollTo({
        top: targetPosition,
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
          const sectionTop = offsetTop - 200; // Offset for navbar and some padding
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

  // Determine if navbar should have blurred background
  // - When scrolled: always blurred
  // - When menu is open on mobile at top: blurred (even if not scrolled)
  const shouldBlur = scrolled || (isMobile && isOpen && !scrolled);
  
  const navClassName = `fixed top-0 left-0 right-0 z-50 transition-all duration-150 ${
    shouldBlur
      ? 'bg-[#fefefecc] backdrop-blur-[5px] dark:bg-[#0a0a0acc] dark:backdrop-blur-[5px]'
      : 'bg-transparent backdrop-blur-0 dark:bg-transparent dark:backdrop-blur-0'
  }`;

  return (
    <motion.nav
      initial={false}
      animate={{ 
        y: isMobile && !isVisible ? -100 : 0, 
        opacity: 1 
      }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className={navClassName}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2"
          >
            <span className="text-foreground font-semibold text-lg" style={{ fontFamily: 'var(--font-family-public-heading), var(--font-gotham), system-ui, sans-serif' }}>Evergreen Systems</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`relative text-md font-medium group transition-colors duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                  style={{ fontFamily: 'var(--font-family-public-body), var(--font-lato), system-ui, sans-serif' }}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                    />
                  )}
                </motion.a>
              );
            })}
            {/* Header Section CTA Buttons */}
            {headerButtons.length > 0 ? (
              headerButtons.map((button) => {
                const isAnchorLink = button.url.startsWith('#');
                return (
                  <motion.div key={button.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      asChild
                      className={cn(
                        "px-5",
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
                            className="h-4 w-4 mr-2"
                          />
                        )}
                        {button.label}
                      </Link>
                    </Button>
                  </motion.div>
                );
              })
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = activeSection === link.sectionId;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    style={{ fontFamily: 'var(--font-family-public-body), var(--font-lato), system-ui, sans-serif' }}
                    onClick={(e) => {
                      handleSmoothScroll(e, link.href);
                      setIsOpen(false);
                    }}
                  >
                    {link.name}
                  </a>
                );
              })}
              {/* Header Section CTA Buttons - Mobile */}
              {headerButtons.length > 0 ? (
                headerButtons.map((button) => {
                  const isAnchorLink = button.url.startsWith('#');
                  return (
                    <Button 
                      key={button.id}
                      asChild
                      className={cn(
                        "w-full",
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
                          setIsOpen(false);
                          trackEvent({
                            event_type: "link_click",
                            entity_type: "cta_button",
                            entity_id: button.id,
                            metadata: {
                              location: "navbar-mobile",
                              href: button.url,
                              label: button.label,
                            },
                          });
                        }}
                      >
                        {button.icon && (
                          <FontAwesomeIcon
                            icon={button.icon as any}
                            className="h-4 w-4 mr-2"
                          />
                        )}
                        {button.label}
                      </Link>
                    </Button>
                  );
                })
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

