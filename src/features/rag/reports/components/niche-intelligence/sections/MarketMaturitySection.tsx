"use client";

import {
  SectionWrapper,
  ContentCard,
  StatCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";

interface MarketMaturity {
  market_maturity?: string;
  growth_rate?: string;
  consolidation_trends?: string;
}

interface MarketMaturitySectionProps {
  data: MarketMaturity;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const MarketMaturitySection = ({
  data,
  sectionNumber = "09",
}: MarketMaturitySectionProps) => {
  return (
    <SectionWrapper
      id="market-maturity"
      number={sectionNumber}
      title="Market Maturity"
      subtitle="Growth rate and consolidation trends"
    >
      <div className="space-y-8">
        {data.market_maturity && (
          <StatCard
            label="Market Maturity"
            value={getText(data.market_maturity, "—")}
            icon={<FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5" />}
            variant="highlight"
          />
        )}

        {data.growth_rate && (
          <ContentCard variant="default" style="summary" title="Growth Rate">
            <p className="text-base font-body text-foreground leading-relaxed">
              {getText(data.growth_rate, "")}
            </p>
          </ContentCard>
        )}

        {data.consolidation_trends && (
          <ContentCard variant="default" style="summary" title="Consolidation Trends">
            <p className="text-base font-body text-foreground leading-relaxed">
              {getText(data.consolidation_trends, "")}
            </p>
          </ContentCard>
        )}
      </div>
    </SectionWrapper>
  );
};
