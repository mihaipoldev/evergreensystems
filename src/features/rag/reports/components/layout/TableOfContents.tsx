"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  number: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}

export const TableOfContents = ({
  sections,
  activeSection,
  onSectionClick,
}: TableOfContentsProps) => {
  return (
    <nav className="sticky top-8">
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-widest text-sidebar-foreground/60 mb-4 font-body">
          Contents
        </h2>
        <div className="w-8 h-0.5 bg-sidebar-primary" />
      </div>

      <ul className="space-y-1">
        {sections.map((section, index) => (
          <motion.li
            key={section.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-md transition-all duration-200 group flex items-start gap-3",
                activeSection === section.id
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <span
                className={cn(
                  "text-xs font-body font-medium w-6 flex-shrink-0 transition-colors",
                  activeSection === section.id
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/40 group-hover:text-sidebar-primary"
                )}
              >
                {section.number}
              </span>
              <span className="text-sm font-body leading-tight">
                {section.title}
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      {/* Decorative element */}
      <div className="mt-8 pt-6 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/40 font-body">
          <p className="mb-1">Powered by</p>
          <p className="text-sidebar-primary font-medium">Niche Intelligence</p>
        </div>
      </div>
    </nav>
  );
};

