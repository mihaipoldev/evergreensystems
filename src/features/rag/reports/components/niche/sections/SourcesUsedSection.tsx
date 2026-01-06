"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faLink,
  faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

interface SourcesUsedSectionProps {
  sources: string[];
}

export const SourcesUsedSection = ({ sources }: SourcesUsedSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="bg-card rounded-xl border border-border report-shadow overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-accent/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faLink} className="w-5 h-5 text-accent" />
            <div>
              <h4 className="text-lg font-display font-semibold text-foreground">
                Sources Used
              </h4>
              <p className="text-sm text-muted-foreground font-body">
                {sources.length} source{sources.length !== 1 ? "s" : ""} referenced in this report
              </p>
            </div>
          </div>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className="w-4 h-4 text-muted-foreground transition-transform"
          />
        </button>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-0 border-t border-border">
                <ul className="space-y-3 mt-4">
                  {sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-body text-accent hover:text-accent/80 transition-colors group"
                      >
                        <span className="truncate flex-1" title={source}>
                          {source}
                        </span>
                        <FontAwesomeIcon icon={faExternalLink} className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

