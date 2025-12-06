"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { trackEvent } from '@/lib/analytics';

type Section = {
  id: string;
  type: string;
  title: string | null;
  admin_title: string | null;
  subtitle: string | null;
  content: any | null;
  media_url: string | null;
  page_section_id: string;
  position: number;
  visible: boolean;
};

type NavbarProps = {
  sections?: Section[];
};

// Helper function to format section type to display name
const formatSectionName = (type: string, title: string | null, adminTitle: string | null): string => {
  // Use admin_title first, then title, then format the type
  if (adminTitle) return adminTitle;
  if (title) {
    // Remove RichText formatting like [[text]]
    return title.replace(/\[\[([^\]]+)\]\]/g, '$1');
  }
  
  // Format type: "testimonials" -> "Testimonials", "faq" -> "FAQ"
  const typeMap: Record<string, string> = {
    'logos': 'Logos',
    'stories': 'Stories',
    'features': 'Services',
    'testimonials': 'Testimonials',
    'results': 'Results',
    'faq': 'FAQ',
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to get anchor href from section type
const getSectionHref = (type: string): string => {
  // Special case: features type uses "services" as anchor
  if (type === 'features') return '#services';
  return `#${type}`;
};

export const Navbar = ({ sections = [] }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler for navigation links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
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

  // Generate navigation links from sections, excluding hero, cta, and logos
  const navLinks = useMemo(() => {
    return sections
      .filter((section) => section.type !== 'hero' && section.type !== 'cta' && section.type !== 'logos' && section.visible)
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        name: formatSectionName(section.type, section.title, section.admin_title),
        href: getSectionHref(section.type),
        sectionId: getSectionHref(section.type).replace('#', ''), // Remove # for ID
      }));
  }, [sections]);

  // Scroll detection to highlight active section
  useEffect(() => {
    // Get the first section element to check if we're above it
    const firstSection = navLinks[0];
    const firstElement = firstSection ? document.getElementById(firstSection.sectionId) : null;
    const heroOffset = firstElement ? firstElement.offsetTop - 300 : 400; // Account for hero section

    // Handle scroll to update active section
    const handleScroll = () => {
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
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [navLinks]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#fefefecc] backdrop-blur-[5px] dark:bg-[#0a0a0acc] dark:backdrop-blur-[5px]'
          : 'bg-transparent backdrop-blur-0 dark:bg-transparent dark:backdrop-blur-0'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-foreground font-semibold text-lg" style={{ fontFamily: 'var(--font-gotham)' }}>Evergreen Systems</span>
          </motion.a>

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
                  style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}
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
            {/* Contact Link */}
            <motion.a
              href="#cta"
              onClick={(e) => handleSmoothScroll(e, '#cta')}
              className={`relative text-md font-medium group transition-colors duration-200 ${
                activeSection === 'cta'
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
              style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}
            >
              Contact
              {activeSection === 'cta' && (
                <motion.span
                  layoutId="activeSection"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                />
              )}
            </motion.a>
            {/* Theme Toggle */}
            {mounted && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-foreground hover:text-primary transition-colors duration-[1ms]"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
            )}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5"
              >
                <Link 
                  href="#cta" 
                  onClick={(e) => {
                    handleSmoothScroll(e, '#cta');
                    trackEvent({
                      event_type: "link_click",
                      entity_type: "cta_button",
                      entity_id: "navbar-get-in-touch",
                      metadata: {
                        location: "header",
                        href: "#cta",
                        label: "Get in Touch",
                      },
                    });
                  }}
                >
                Get in Touch
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle Mobile */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
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
                    style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}
                    onClick={(e) => {
                      handleSmoothScroll(e, link.href);
                      setIsOpen(false);
                    }}
                  >
                    {link.name}
                  </a>
                );
              })}
              <a
                href="#cta"
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'cta'
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}
                onClick={(e) => {
                  handleSmoothScroll(e, '#cta');
                  setIsOpen(false);
                }}
              >
                Contact
              </a>
              <Button 
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
              >
                <Link 
                  href="#cta" 
                  onClick={(e) => {
                    handleSmoothScroll(e, '#cta');
                    setIsOpen(false);
                    trackEvent({
                      event_type: "link_click",
                      entity_type: "cta_button",
                      entity_id: "navbar-get-in-touch-mobile",
                      metadata: {
                        location: "header",
                        href: "#cta",
                        label: "Get in Touch",
                      },
                    });
                  }}
                >
                Get in Touch
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

