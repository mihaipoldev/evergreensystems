"use client";

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export type MobileNavLink = {
  name: string;
  href: string;
  sectionId: string;
};

export type MobileCTA = {
  id: string;
  label: string;
  url: string;
  icon?: any;
  style?: 'primary' | 'secondary';
};

type MobileNavMenuProps = {
  navLinks: MobileNavLink[];
  activeSection: string;
  ctaButtons: MobileCTA[];
  onMobileLinkClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isAnchor: boolean,
  ) => void;
};

export const MobileNavMenu = ({
  navLinks,
  activeSection,
  ctaButtons,
  onMobileLinkClick,
}: MobileNavMenuProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key="mobile-nav-sheet"
      id="mobile-nav-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="relative flex h-full flex-col pt-16">
        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-6 pt-8 pb-4">
          <ul className="flex flex-col">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.sectionId;
              return (
                <motion.li
                  key={link.name}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : 0.04 + index * 0.025,
                    duration: 0.2,
                    ease: 'easeOut',
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
        {ctaButtons.length > 0 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.04 + navLinks.length * 0.025,
              duration: 0.22,
              ease: 'easeOut',
            }}
            className="px-6 pt-4 pb-6 flex flex-col gap-3"
          >
            {ctaButtons.map((button) => {
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
