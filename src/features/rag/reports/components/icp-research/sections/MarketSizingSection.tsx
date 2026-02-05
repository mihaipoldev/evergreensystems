"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faCircleInfo,
  faLightbulb,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import {
  SectionWrapper,
  BlockHeader,
  ContentCard,
  InsightList,
} from "../../shared";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

type MarketSizingData = {
  description?: string;
  estimates?: Record<
    string,
    { basis?: string; range?: string; confidence?: string }
  >;
  methodology?: {
    approach?: string;
    date_of_estimate?: string;
    how_to_replicate?: string[];
    refresh_recommendation?: string;
  };
  planning_implications?: {
    for_budget_planning?: string;
    for_campaign_planning?: string;
    data_quality_expectation?: string;
  };
};

export const MarketSizingSection = ({ data }: { data: ReportData }) => {
  const marketSizing = (data.data as { market_sizing?: MarketSizingData })
    ?.market_sizing;

  if (!marketSizing) {
    return (
      <SectionWrapper
        id="market-sizing"
        number="07"
        title="Market Sizing"
        subtitle="TAM estimates and planning implications"
      >
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  const estimates = marketSizing.estimates
    ? Object.entries(marketSizing.estimates)
    : [];
  const methodology = marketSizing.methodology;
  const planning = marketSizing.planning_implications;

  return (
    <SectionWrapper
      id="market-sizing"
      number="07"
      title="Market Sizing"
      subtitle="TAM estimates and planning implications"
    >
      {marketSizing.description && (
        <div className="mb-8">
          <ContentCard variant="muted" style="summary">
            <p className="text-sm font-body text-foreground leading-relaxed">
              {marketSizing.description}
            </p>
          </ContentCard>
        </div>
      )}

      {estimates.length > 0 && (
        <div className="mb-8">
          <BlockHeader
            variant="title"
            title="Estimates"
            icon={
              <FontAwesomeIcon icon={faChartPie} className="w-5 h-5 text-accent" />
            }
          />
          <div className="space-y-4">
            {estimates.map(([key, value]) => {
              const label = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              const v = value as { basis?: string; range?: string; confidence?: string };
              return (
                <ContentCard
                  key={key}
                  variant="default"
                  style="summary"
                  title={label}
                >
                  <p className="text-sm font-body text-foreground mb-2">
                    <strong>Range:</strong> {v.range ?? "—"}
                    {v.confidence != null && (
                      <span className="text-muted-foreground ml-2">
                        (Confidence: {v.confidence})
                      </span>
                    )}
                  </p>
                  {v.basis && (
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                      {v.basis}
                    </p>
                  )}
                </ContentCard>
              );
            })}
          </div>
        </div>
      )}

      {methodology && (
        <div className="mb-8">
          <BlockHeader
            variant="title"
            title="Methodology"
            icon={
              <FontAwesomeIcon icon={faCircleInfo} className="w-5 h-5 text-accent" />
            }
          />
          <div className="space-y-4">
            {methodology.approach && (
              <p className="text-sm font-body text-foreground leading-relaxed">
                {methodology.approach}
              </p>
            )}
            {methodology.date_of_estimate && (
              <p className="text-sm font-body text-muted-foreground">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2" />
                Date of estimate: {methodology.date_of_estimate}
              </p>
            )}
            {Array.isArray(methodology.how_to_replicate) &&
              methodology.how_to_replicate.length > 0 && (
                <InsightList
                  items={methodology.how_to_replicate}
                  type="default"
                  numbered
                />
              )}
            {methodology.refresh_recommendation && (
              <p className="text-sm font-body text-muted-foreground">
                {methodology.refresh_recommendation}
              </p>
            )}
          </div>
        </div>
      )}

      {planning &&
        (planning.for_budget_planning ||
          planning.for_campaign_planning ||
          planning.data_quality_expectation) && (
          <div>
            <BlockHeader
              variant="title"
              title="Planning Implications"
              icon={
                <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-accent" />
              }
            />
            <div className="space-y-4">
              {planning.for_budget_planning && (
                <ContentCard variant="accent" style="summary" title="Budget Planning">
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {planning.for_budget_planning}
                  </p>
                </ContentCard>
              )}
              {planning.for_campaign_planning && (
                <ContentCard variant="accent" style="summary" title="Campaign Planning">
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {planning.for_campaign_planning}
                  </p>
                </ContentCard>
              )}
              {planning.data_quality_expectation && (
                <ContentCard variant="muted" style="summary" title="Data Quality Expectation">
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {planning.data_quality_expectation}
                  </p>
                </ContentCard>
              )}
            </div>
          </div>
        )}
    </SectionWrapper>
  );
};
