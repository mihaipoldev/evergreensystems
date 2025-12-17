"use client";

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faShareAlt } from '@fortawesome/free-solid-svg-icons';

type FooterSection = {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
};

type SocialPlatform = {
  id: string;
  name: string;
  icon: string | null;
  base_url: string | null;
  section_social: {
    id: string;
    order: number;
    status?: "published" | "draft" | "deactivated";
  };
};

type FooterProps = {
  section?: FooterSection;
  socialPlatforms?: SocialPlatform[];
};

export const Footer = ({ section, socialPlatforms = [] }: FooterProps) => {
  const heading = section?.title?.trim() || "Evergreen Systems";
  const subtitle =
    section?.subtitle?.trim() ||
    "Building intelligent automation systems that transform how businesses operate.";
  const footerId = section?.id ? `footer-${section.id}` : "footer";

  // Sort social platforms by order
  const sortedSocialPlatforms = [...socialPlatforms].sort((a, b) => a.section_social.order - b.section_social.order);

  return (
    <footer
      id={footerId}
      className="relative border-t border-border/50 bg-background/30"
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main footer content - grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left column - Brand/Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2 h-5 flex items-center">
              {heading}
            </h4>
            <div className="mb-2 min-h-[3.5rem] flex items-center">
              {subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {subtitle}
                </p>
              )}
            </div>
          </motion.div>

          {/* Middle column - Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2 h-5 flex items-center">
              Contact
            </h4>
            <div className="mb-2 min-h-[3.5rem] flex items-center">
              <a
                href="mailto:hello@evergreensystems.ai"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group h-10"
              >
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" 
                />
                <span>hello@evergreensystems.ai</span>
              </a>
            </div>
          </motion.div>

          {/* Right column - Social Links */}
          {sortedSocialPlatforms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col"
            >
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2 h-5 flex items-center">
                Connect
              </h4>
              <div className="mb-2 min-h-[3.5rem] flex items-center">
                <div className="flex items-center gap-3 flex-wrap h-10">
                  {sortedSocialPlatforms.map((platform) => {
                    const platformUrl = platform.base_url || "#";
                    return (
                      <a
                        key={platform.id}
                        href={platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={platform.name}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all duration-200 group"
                      >
                        {platform.icon ? (
                          <img
                            src={platform.icon}
                            alt={platform.name}
                            className="h-5 w-5 object-contain group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback = document.createElement("div");
                              fallback.className = "h-4 w-4 text-current";
                              fallback.innerHTML = `<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/></svg>`;
                              target.parentElement?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <FontAwesomeIcon 
                            icon={faShareAlt} 
                            className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" 
                          />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-muted-foreground"
        >
          <p>© {new Date().getFullYear()} Evergreen Systems. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

