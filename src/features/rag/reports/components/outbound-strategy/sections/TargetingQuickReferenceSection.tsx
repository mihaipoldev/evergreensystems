"use client";

import { SectionWrapper, BlockHeader, ContentCard } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndustry,
  faMapMarkerAlt,
  faChartLine,
  faLaptop,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

type IndustryItem = {
  industry?: string;
  reason?: string;
  naics?: string;
  keywords?: string;
  fit_score?: string;
  qualification?: string;
};

type Industries = {
  primary_focus?: IndustryItem[];
  avoid?: IndustryItem[];
  adjacent_opportunities?: IndustryItem[];
};

type TargetingQuickReference = {
  description?: string;
  industries?: Industries;
  firmographics?: Record<string, unknown>;
  technographics?: {
    positive_signals?: string[];
    negative_signals?: string[];
  };
  behavioral_signals?: string[];
};

interface TargetingQuickReferenceSectionProps {
  targetingQuickReference: TargetingQuickReference;
  sectionNumber?: string;
}

export const TargetingQuickReferenceSection = ({
  targetingQuickReference,
  sectionNumber = "12",
}: TargetingQuickReferenceSectionProps) => {
  const industries = targetingQuickReference?.industries;
  const firmographics = targetingQuickReference?.firmographics;
  const technographics = targetingQuickReference?.technographics;
  const behavioralSignals = targetingQuickReference?.behavioral_signals ?? [];

  return (
    <SectionWrapper
      id="targeting-quick-reference"
      number={sectionNumber}
      title="Targeting Quick Reference"
      subtitle={targetingQuickReference?.description ?? "Industries, firmographics, technographics, and behavioral signals"}
    >
      {/* Industries */}
      {industries && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Industries"
            icon={<FontAwesomeIcon icon={faIndustry} className="w-5 h-5 text-accent" />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {industries.primary_focus && industries.primary_focus.length > 0 && (
              <ContentCard variant="green" title="Primary Focus">
                <ul className="space-y-3">
                  {industries.primary_focus.map((item, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.industry}</span>
                      {item.fit_score && (
                        <span className="text-muted-foreground ml-1">({item.fit_score})</span>
                      )}
                      {item.keywords && (
                        <p className="text-xs text-muted-foreground mt-1">{item.keywords}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {industries.avoid && industries.avoid.length > 0 && (
              <ContentCard variant="danger" title="Avoid">
                <ul className="space-y-3">
                  {industries.avoid.map((item, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.industry}</span>
                      {item.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {industries.adjacent_opportunities && industries.adjacent_opportunities.length > 0 && (
              <ContentCard variant="accent" title="Adjacent Opportunities">
                <ul className="space-y-3">
                  {industries.adjacent_opportunities.map((item, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.industry}</span>
                      {item.fit_score && (
                        <span className="text-muted-foreground ml-1">({item.fit_score})</span>
                      )}
                      {item.qualification && (
                        <p className="text-xs text-muted-foreground mt-1">{item.qualification}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
          </div>
        </div>
      )}

      {/* Firmographics */}
      {firmographics && Object.keys(firmographics).length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Firmographics"
            icon={<FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-accent" />}
          />
          <ContentCard title="Key Criteria">
            <div className="space-y-3">
              {Object.entries(firmographics).map(([key, val]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-foreground capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>{" "}
                  {typeof val === "object" && val !== null ? (
                    <pre className="text-xs mt-1 overflow-x-auto">
                      {JSON.stringify(val, null, 2)}
                    </pre>
                  ) : (
                    String(val)
                  )}
                </div>
              ))}
            </div>
          </ContentCard>
        </div>
      )}

      {/* Technographics */}
      {technographics && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Technographics"
            icon={<FontAwesomeIcon icon={faLaptop} className="w-5 h-5 text-accent" />}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technographics.positive_signals && technographics.positive_signals.length > 0 && (
              <ContentCard variant="green" title="Positive Signals">
                <ul className="space-y-2">
                  {technographics.positive_signals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {technographics.negative_signals && technographics.negative_signals.length > 0 && (
              <ContentCard variant="danger" title="Negative Signals">
                <ul className="space-y-2">
                  {technographics.negative_signals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
          </div>
        </div>
      )}

      {/* Behavioral Signals */}
      {behavioralSignals.length > 0 && (
        <div>
          <BlockHeader
            variant="title"
            title="Behavioral Signals"
            icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-accent" />}
          />
          <ul className="space-y-2">
            {behavioralSignals.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground p-3 rounded-lg bg-accent/5 border border-accent/20">
                <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionWrapper>
  );
};
