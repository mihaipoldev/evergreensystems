import { SectionWrapper } from "../../shared/SectionWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBriefcase,
  faDollarSign,
  faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface ResearchLinksSectionProps {
  researchLinks: NonNullable<ReportData["data"]["research_links"]>;
}

export const ResearchLinksSection = ({ researchLinks }: ResearchLinksSectionProps) => {
  return (
    <SectionWrapper
      id="research-links"
      number="10"
      title="Research Links"
      subtitle="Additional research and discovery resources for this niche"
    >
      <div className="space-y-6">
        {researchLinks.google_search_links && researchLinks.google_search_links.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border report-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-accent" />
              <h4 className="text-lg font-display font-semibold text-foreground">
                Google Search Links
              </h4>
            </div>
            <ul className="space-y-3">
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
        )}

        {researchLinks.linkedin_job_search_links && researchLinks.linkedin_job_search_links.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border report-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 text-accent" />
              <h4 className="text-lg font-display font-semibold text-foreground">
                LinkedIn Job Search Links
              </h4>
            </div>
            <ul className="space-y-3">
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
        )}

        {researchLinks.funding_search_links && researchLinks.funding_search_links.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border report-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-accent" />
              <h4 className="text-lg font-display font-semibold text-foreground">
                Funding Search Links
              </h4>
            </div>
            <ul className="space-y-3">
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
        )}
      </div>
    </SectionWrapper>
  );
};

