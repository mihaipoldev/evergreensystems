"use client";

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';

type FooterSection = {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
};

type FooterProps = {
  section?: FooterSection;
};

export const Footer = ({ section }: FooterProps) => {
  const heading = section?.title?.trim() || "Evergreen Systems";
  const subtitle =
    section?.subtitle?.trim() ||
    "Building intelligent automation systems that transform how businesses operate. AI-powered solutions for modern teams.";
  const footerId = section?.id ? `footer-${section.id}` : "footer";

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
            <div className="flex items-center justify-center gap-4">
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 border border-border/50 text-muted-foreground transition-all duration-150 hover:bg-background hover:border-border hover:text-foreground"
              >
                <FontAwesomeIcon 
                  icon={faTwitter} 
                  className="h-4 w-4" 
                />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-background/50 border border-border/50 text-muted-foreground transition-all duration-150 hover:bg-background hover:border-border hover:text-foreground"
              >
                <FontAwesomeIcon 
                  icon={faLinkedin} 
                  className="h-4 w-4" 
                />
              </a>
            </div>
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

