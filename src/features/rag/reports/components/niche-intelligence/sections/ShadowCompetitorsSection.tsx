"use client";

import {
  SectionWrapper,
  TagCloud,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faExclamationTriangle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

interface CompetitiveThreat {
  competitor_type?: string;
  why_they_lose_to_them?: string;
  market_share_impact?: string;
}

interface ShadowCompetitors {
  primary_competitors?: string[];
  competitive_threats?: CompetitiveThreat[];
  differentiation_factors?: string[];
}

interface ShadowCompetitorsSectionProps {
  data: ShadowCompetitors;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const ShadowCompetitorsSection = ({
  data,
  sectionNumber = "07",
}: ShadowCompetitorsSectionProps) => {
  return (
    <SectionWrapper
      id="shadow-competitors"
      number={sectionNumber}
      title="Shadow Competitors"
      subtitle="Primary competitors, competitive threats, and differentiation factors"
    >
      <div className="space-y-8">
        {data.primary_competitors && data.primary_competitors.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Primary Competitors"
              icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-accent" />}
            />
            <TagCloud tags={data.primary_competitors} variant="accent" />
          </div>
        )}

        {data.competitive_threats && data.competitive_threats.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Competitive Threats"
              icon={<FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-2 mt-4">
              {data.competitive_threats.map((threat, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/40 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {getText(threat.competitor_type, `Competitor ${index + 1}`)}
                  </p>
                  <p className="text-sm font-body text-muted-foreground mt-1.5 leading-snug">
                    {getText(threat.why_they_lose_to_them, "")}
                  </p>
                  {threat.market_share_impact && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      <span className="font-medium text-foreground">Market share impact: </span>
                      {threat.market_share_impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.differentiation_factors && data.differentiation_factors.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Differentiation Factors"
              icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5 text-accent" />}
            />
            <TagCloud tags={data.differentiation_factors} variant="outline" />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
