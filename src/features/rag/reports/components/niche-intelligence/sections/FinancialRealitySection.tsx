"use client";

import {
  SectionWrapper,
  ContentCard,
  StatCard,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faDollarSign } from "@fortawesome/free-solid-svg-icons";

interface FinancialReality {
  margin_pressure?: string;
  pricing_dynamics?: string;
  unit_economics?: string;
  cost_structure_notes?: string;
}

interface FinancialRealitySectionProps {
  data: FinancialReality;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const FinancialRealitySection = ({
  data,
  sectionNumber = "08",
}: FinancialRealitySectionProps) => {
  return (
    <SectionWrapper
      id="financial-reality"
      number={sectionNumber}
      title="Financial Reality"
      subtitle="Margin pressure, pricing dynamics, and cost structure"
    >
      <div className="space-y-8">
        {data.margin_pressure && (
          <StatCard
            label="Margin Pressure"
            value={getText(data.margin_pressure, "—")}
            icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
            variant="highlight"
          />
        )}

        <div className="space-y-6">
          {data.pricing_dynamics && (
            <ContentCard variant="default" style="summary" title="Pricing Dynamics">
              <p className="text-base font-body text-foreground leading-relaxed">
                {getText(data.pricing_dynamics, "")}
              </p>
            </ContentCard>
          )}
          {data.unit_economics && (
            <ContentCard variant="default" style="summary" title="Unit Economics">
              <p className="text-base font-body text-foreground leading-relaxed">
                {getText(data.unit_economics, "")}
              </p>
            </ContentCard>
          )}
          {data.cost_structure_notes && (
            <ContentCard variant="default" style="summary" title="Cost Structure Notes">
              <p className="text-base font-body text-foreground leading-relaxed">
                {getText(data.cost_structure_notes, "")}
              </p>
            </ContentCard>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};
