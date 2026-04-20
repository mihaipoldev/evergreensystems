"use client";

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { Logo } from '@/components/shared/Logo';
import type { CTAButtonWithSection } from '@/features/media/types';

type NavLink = {
  name: string;
  href: string;
  sectionId: string;
};

type MobileNavMenuProps = {
  navLinks: NavLink[];
  activeSection: string;
  headerButtons: CTAButtonWithSection[];
  onMobileLinkClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isAnchor: boolean,
  ) => void;
  onClose: () => void;
};

export const MobileNavMenu = ({
  navLinks,
  activeSection,
  headerButtons,
  onMobileLinkClick,
  onClose,
}: MobileNavMenuProps) => {
  const prefersReducedMotion = useReducedMotion();

  const sheetInitial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: '-100%' };
  const sheetAnimate = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };
  const sheetExit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: '-100%' };

  return (
    <motion.div
      key="mobile-nav-sheet"
      id="mobile-nav-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="md:hidden fixed inset-0 z-[80] bg-background overflow-hidden"
      initial={sheetInitial}
      animate={sheetAnimate}
      exit={sheetExit}
      transition={
        prefersReducedMotion
          ? { duration: 0.2 }
          : {
              type: 'spring',
              stiffness: 220,
              damping: 28,
              mass: 0.9,
              opacity: { duration: 0.25, ease: 'easeOut' },
            }
      }
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Soft brand glow background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Top bar — mirrors navbar layout */}
        <div className="flex items-center justify-between p-3">
          <Link
            href="/"
            onClick={onClose}
            aria-label="Home"
            className="ml-3 flex items-center"
          >
            <Logo variant="horizontal" className="h-6" usePrimaryColor={true} />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="h-10 w-10 rounded-xl flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 active:scale-95 transition-all text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          <ul className="flex flex-col">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.sectionId;
              return (
                <motion.li
                  key={link.name}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : 0.12 + index * 0.045,
                    duration: 0.32,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <a
                    href={link.href}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={(e) => onMobileLinkClick(e, link.href, true)}
                    className={cn(
                      'group flex items-center justify-between py-4 transition-colors',
                      isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                    )}
                    style={{
                      fontFamily:
                        'var(--font-family-public-heading), var(--font-family-public-body), var(--font-lato), system-ui, sans-serif',
                    }}
                  >
                    <span className="flex items-center gap-3">
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="h-7 w-1 rounded-full bg-primary"
                        />
                      )}
                      <span
                        className={cn(
                          'text-3xl tracking-tight transition-all',
                          isActive ? 'font-semibold' : 'font-medium'
                        )}
                      >
                        {link.name}
                      </span>
                    </span>
                    <ChevronRight
                      size={22}
                      className={cn(
                        'transition-all',
                        isActive
                          ? 'text-primary opacity-100 translate-x-1'
                          : 'text-muted-foreground/60 opacity-70 group-hover:opacity-100 group-hover:translate-x-1'
                      )}
                    />
                  </a>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* CTA buttons pinned to bottom */}
        {headerButtons.length > 0 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.12 + navLinks.length * 0.045,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="px-6 pt-4 pb-6 flex flex-col gap-3"
          >
            {headerButtons.map((button) => {
              const isAnchorLink = button.url.startsWith('#');
              return (
                <Button
                  key={button.id}
                  asChild
                  className={cn(
                    'w-full h-14 rounded-full text-base font-medium shadow-lg shadow-primary/20',
                    button.style === 'primary' || !button.style
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : button.style === 'secondary'
                      ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  )}
                >
                  <Link
                    href={button.url}
                    {...(isAnchorLink
                      ? {}
                      : { target: '_blank', rel: 'noopener noreferrer' })}
                    onClick={(e) => {
                      onMobileLinkClick(e, button.url, isAnchorLink);
                      trackEvent({
                        event_type: 'link_click',
                        entity_type: 'cta_button',
                        entity_id: button.id,
                        metadata: {
                          location: 'navbar-mobile',
                          href: button.url,
                          label: button.label,
                        },
                      });
                    }}
                  >
                    {button.icon && (
                      <FontAwesomeIcon
                        icon={button.icon as any}
                        className="!h-4 !w-4 mr-2"
                      />
                    )}
                    {button.label}
                  </Link>
                </Button>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
