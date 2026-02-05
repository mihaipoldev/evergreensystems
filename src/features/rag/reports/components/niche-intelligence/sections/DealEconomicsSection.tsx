"use client";

import {
  SectionWrapper,
  StatCard,
  KeyValueBlock,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faCalendar,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";

interface DealEconomics {
  typical_client_value_annually?: string;
  average_deal_size?: string;
  contract_length_months?: number;
  retention_rate_percent?: number;
}

interface DealEconomicsSectionProps {
  data: DealEconomics;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const DealEconomicsSection = ({ data, sectionNumber = "04" }: DealEconomicsSectionProps) => {
  return (
    <SectionWrapper
      id="deal-economics"
      number={sectionNumber}
      title="Deal Economics"
      subtitle="Financial metrics and contract terms"
    >
      <div className="space-y-6">
        <BlockHeader
          variant="title"
          title="Key Metrics"
          icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-accent" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.contract_length_months != null && (
            <StatCard
              label="Contract Length"
              value={`${data.contract_length_months} months`}
              icon={<FontAwesomeIcon icon={faCalendar} className="w-5 h-5" />}
            />
          )}
          {data.retention_rate_percent != null && (
            <StatCard
              label="Retention Rate"
              value={`${data.retention_rate_percent}%`}
              icon={<FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5" />}
              variant="highlight"
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.typical_client_value_annually && (
            <KeyValueBlock
              label="Typical Client Value Annually"
              value={getText(data.typical_client_value_annually, "—")}
            />
          )}
          {data.average_deal_size && (
            <KeyValueBlock
              label="Average Deal Size"
              value={getText(data.average_deal_size, "—")}
            />
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};
