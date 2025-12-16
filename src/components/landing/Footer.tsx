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
    "Building intelligent automation systems that transform how businesses operate. AI-powered solutions for modern teams.";
  const footerId = section?.id ? `footer-${section.id}` : "footer";

  // Sort social platforms by order
  const sortedSocialPlatforms = [...socialPlatforms].sort((a, b) => a.section_social.order - b.section_social.order);

  return (
    <footer
      id={footerId}
      className="relative text-foreground border-t border-border"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-12 mdpy-20 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="flex flex-col items-center space-y-8 text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center space-y-4"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{heading}</h3>
            {subtitle && (
              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Contact and Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center space-y-6"
          >
            {/* Email */}
            <a
              href="mailto:hello@evergreensystems.ai"
              className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium text-foreground bg-background/50 border border-border/50 hover:bg-background hover:border-border transition-all duration-150"
            >
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="h-4 w-4 text-primary" 
              />
              <span>hello@evergreensystems.ai</span>
            </a>

            {/* Social Links */}
            {sortedSocialPlatforms.length > 0 && (
              <div className="flex items-center justify-center gap-4">
                {sortedSocialPlatforms.map((platform) => {
                  const platformUrl = platform.base_url || "#";
                  return (
                    <a
                      key={platform.id}
                      href={platformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platform.name}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 border border-border/50 text-muted-foreground transition-all duration-150 hover:bg-background hover:border-border hover:text-foreground"
                    >
                      {platform.icon ? (
                        <img
                          src={platform.icon}
                          alt={platform.name}
                          className="h-6 w-6 object-contain"
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
                          className="h-4 w-4" 
                        />
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="flex justify-center mb-8">
          <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center space-y-2 text-center text-sm text-muted-foreground"
        >
          <p>© {new Date().getFullYear()} Evergreen Systems. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

