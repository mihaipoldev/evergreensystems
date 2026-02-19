"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faShieldHalved,
  faTrophy,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  SectionWrapper,
  StatCard,
  TagCloud,
  BlockHeader,
  InsightList,
} from "../../shared";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

interface CompetitiveContextSectionProps {
  data: ReportData;
}

export const CompetitiveContextSection = ({ data }: CompetitiveContextSectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: Record<string, unknown> }).buyer_icp;
  const competitive = buyerIcp?.competitive_context as Record<string, unknown> | undefined;

  if (!competitive) {
    return (
      <SectionWrapper id="competitive-context" number="05" title="Competitive Context" subtitle="What alternatives these customers consider and how to compete">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  const alternatives = (competitive.alternatives as Array<Record<string, unknown>>) ?? [];
  const positioningGuidance = (competitive.positioning_guidance as Record<string, unknown>) ?? {};
  const whenClearlyWins = (positioningGuidance.when_clearly_wins as string[] | undefined) ?? [];
  const hasConfidence = typeof competitive.confidence === "number";

  return (
    <SectionWrapper
      id="competitive-context"
      number="05"
      title="Competitive Context"
      subtitle="What alternatives these customers consider and how to compete"
    >
      <div className={`grid grid-cols-1 gap-4 mb-8 ${hasConfidence ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {hasConfidence && (
          <StatCard
            label="Confidence"
            value={`${((competitive.confidence as number) * 100).toFixed(0)}%`}
            icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />}
          />
        )}
        <StatCard
          label="Alternatives Analyzed"
          value={alternatives.length}
          icon={<FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Win Scenarios"
          value={whenClearlyWins.length}
          icon={<FontAwesomeIcon icon={faTrophy} className="w-5 h-5" />}
        />
      </div>

      <div className="mb-10">
        <BlockHeader variant="title" title="Competitive Alternatives" />
        <div className="space-y-4">
          {alternatives.map((alt: Record<string, unknown>) => (
            <div
              key={alt.alternative as string}
              className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {alt.alternative as string}
                    </h3>
                    {Array.isArray(alt.platforms) && (alt.platforms as string[]).length > 0 && (
                      <div className="mb-3">
                        <TagCloud tags={alt.platforms as string[]} variant="outline" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                      When This is Chosen
                    </span>
                    <p className="text-sm font-body text-foreground">{alt.when_chosen as string}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 border border-border border-l-4 border-l-green-500">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                        Their Strengths
                      </span>
                      <p className="text-sm font-body text-foreground">{alt.strengths as string}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border border-l-4 border-l-red-500">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                        Their Weaknesses
                      </span>
                      <p className="text-sm font-body text-foreground">{alt.weaknesses as string}</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 border border-border border-l-4 border-l-accent">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                      How to Win
                    </span>
                    <p className="text-sm font-body text-foreground">{alt.how_custom_wins as string}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <BlockHeader variant="title" title="Positioning Guidance" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <BlockHeader variant="label" title="When You Clearly Win" />
            <InsightList items={whenClearlyWins} type="success" />
          </div>
          <div>
            <BlockHeader variant="label" title="When You Are Probably Wrong Fit" />
            <InsightList
              items={(positioningGuidance.when_probably_wrong as string[] | undefined) ?? []}
              type="danger"
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
