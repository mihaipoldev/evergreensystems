"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { CTAButtonWithSection } from '@/features/page-builder/cta/types';

type NavLink = {
  name: string;
  href: string;
  sectionId: string;
};

type MobileNavMenuProps = {
  navLinks: NavLink[];
  activeSection: string;
  headerButtons: CTAButtonWithSection[];
  handleSmoothScroll: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  onLinkClick: () => void;
};

export const MobileNavMenu = ({
  navLinks,
  activeSection,
  headerButtons,
  handleSmoothScroll,
  onLinkClick,
}: MobileNavMenuProps) => {
  return (
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
                onLinkClick();
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
                    onLinkClick();
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
  );
};
