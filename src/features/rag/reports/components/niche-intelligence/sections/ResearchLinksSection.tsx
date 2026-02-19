"use client";

import { useState, useEffect } from "react";
import { SectionWrapper } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBriefcase,
  faDollarSign,
  faExternalLink,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStoredCollapsibleState,
  setStoredCollapsibleState,
  getReportGroupId,
} from "@/lib/collapsible-persistence";
interface ResearchLinks {
  google_search_links?: string[];
  linkedin_job_search_links?: string[];
  funding_search_links?: string[];
  confidence?: number;
  description?: string;
}

interface ResearchLinksSectionProps {
  researchLinks: ResearchLinks;
  reportId: string;
  sectionNumber?: string;
}

export const ResearchLinksSection = ({ researchLinks, reportId, sectionNumber = "12" }: ResearchLinksSectionProps) => {
  const googleGroupId = getReportGroupId(reportId, "research-links-google");
  const linkedinGroupId = getReportGroupId(reportId, "research-links-linkedin");
  const fundingGroupId = getReportGroupId(reportId, "research-links-funding");

  const [isGoogleExpanded, setIsGoogleExpanded] = useState(() =>
    getStoredCollapsibleState(googleGroupId, false)
  );
  const [isLinkedInExpanded, setIsLinkedInExpanded] = useState(() =>
    getStoredCollapsibleState(linkedinGroupId, false)
  );
  const [isFundingExpanded, setIsFundingExpanded] = useState(() =>
    getStoredCollapsibleState(fundingGroupId, false)
  );

  // Update localStorage when state changes
  useEffect(() => {
    setStoredCollapsibleState(googleGroupId, isGoogleExpanded);
  }, [googleGroupId, isGoogleExpanded]);

  useEffect(() => {
    setStoredCollapsibleState(linkedinGroupId, isLinkedInExpanded);
  }, [linkedinGroupId, isLinkedInExpanded]);

  useEffect(() => {
    setStoredCollapsibleState(fundingGroupId, isFundingExpanded);
  }, [fundingGroupId, isFundingExpanded]);
  return (
    <SectionWrapper
      id="research-links"
      number={sectionNumber}
      title="Research Links"
      subtitle="Additional research and discovery resources for this niche"
    >
      <div className="space-y-6">
        {researchLinks.google_search_links && researchLinks.google_search_links.length > 0 && (
          <div className="bg-card rounded-xl border border-border report-shadow overflow-hidden">
            <button
              onClick={() => setIsGoogleExpanded(!isGoogleExpanded)}
              className="w-full flex items-center justify-between p-6 hover:bg-accent/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-accent" />
                <h4 className="text-lg font-display font-semibold text-foreground">
                  Google Search Links
                </h4>
                <span className="text-sm text-muted-foreground font-body">
                  ({researchLinks.google_search_links.length})
                </span>
              </div>
              <FontAwesomeIcon
                icon={isGoogleExpanded ? faChevronUp : faChevronDown}
                className="w-4 h-4 text-muted-foreground transition-transform"
              />
            </button>
            <AnimatePresence>
              {isGoogleExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0 border-t border-border">
                    <ul className="space-y-3 mt-4">
                      {researchLinks.google_search_links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-body text-accent hover:text-accent/80 transition-colors group"
                          >
                            <span className="truncate flex-1" title={link}>
                              {link}
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
        )}

        {researchLinks.linkedin_job_search_links && researchLinks.linkedin_job_search_links.length > 0 && (
          <div className="bg-card rounded-xl border border-border report-shadow overflow-hidden">
            <button
              onClick={() => setIsLinkedInExpanded(!isLinkedInExpanded)}
              className="w-full flex items-center justify-between p-6 hover:bg-accent/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 text-accent" />
                <h4 className="text-lg font-display font-semibold text-foreground">
                  LinkedIn Job Search Links
                </h4>
                <span className="text-sm text-muted-foreground font-body">
                  ({researchLinks.linkedin_job_search_links.length})
                </span>
              </div>
              <FontAwesomeIcon
                icon={isLinkedInExpanded ? faChevronUp : faChevronDown}
                className="w-4 h-4 text-muted-foreground transition-transform"
              />
            </button>
            <AnimatePresence>
              {isLinkedInExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0 border-t border-border">
                    <ul className="space-y-3 mt-4">
                      {researchLinks.linkedin_job_search_links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-body text-accent hover:text-accent/80 transition-colors group"
                          >
                            <span className="truncate flex-1" title={link}>
                              {link}
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
        )}

        {researchLinks.funding_search_links && researchLinks.funding_search_links.length > 0 && (
          <div className="bg-card rounded-xl border border-border report-shadow overflow-hidden">
            <button
              onClick={() => setIsFundingExpanded(!isFundingExpanded)}
              className="w-full flex items-center justify-between p-6 hover:bg-accent/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-accent" />
                <h4 className="text-lg font-display font-semibold text-foreground">
                  Funding Search Links
                </h4>
                <span className="text-sm text-muted-foreground font-body">
                  ({researchLinks.funding_search_links.length})
                </span>
              </div>
              <FontAwesomeIcon
                icon={isFundingExpanded ? faChevronUp : faChevronDown}
                className="w-4 h-4 text-muted-foreground transition-transform"
              />
            </button>
            <AnimatePresence>
              {isFundingExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0 border-t border-border">
                    <ul className="space-y-3 mt-4">
                      {researchLinks.funding_search_links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-body text-accent hover:text-accent/80 transition-colors group"
                          >
                            <span className="truncate flex-1" title={link}>
                              {link}
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
        )}
      </div>
    </SectionWrapper>
  );
};

