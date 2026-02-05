"use client";

import {
  SectionWrapper,
  StatCard,
  TagCloud,
  BlockHeader,
  KeyValueBlock,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faArrowTrendUp,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

interface TamAnalysis {
  total_companies_in_geography?: number;
  addressable_by_segment?: Record<string, string>;
  market_concentration?: string;
  geographic_clusters?: string[];
  regional_differences?: string;
}

interface TamAnalysisSectionProps {
  tam: TamAnalysis;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const TamAnalysisSection = ({ tam, sectionNumber = "02" }: TamAnalysisSectionProps) => {
  return (
    <SectionWrapper
      id="tam-analysis"
      number={sectionNumber}
      title="TAM Analysis"
      subtitle="Total addressable market, segmentation, and geographic distribution"
    >
      <div className="space-y-8">
        {(tam.total_companies_in_geography != null || tam.market_concentration) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tam.total_companies_in_geography != null && (
              <StatCard
                label="Total Companies"
                value={tam.total_companies_in_geography.toLocaleString()}
                icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />}
                variant="highlight"
              />
            )}
            {tam.market_concentration && (
              <StatCard
                label="Market Concentration"
                value={getText(tam.market_concentration, "—")}
                icon={<FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5" />}
              />
            )}
          </div>
        )}

        {tam.addressable_by_segment && Object.keys(tam.addressable_by_segment).length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Addressable by Segment"
              icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {Object.entries(tam.addressable_by_segment).map(([segment, count], index) => (
                <KeyValueBlock key={index} label={segment} value={count} />
              ))}
            </div>
          </div>
        )}

        {tam.geographic_clusters && tam.geographic_clusters.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Geographic Clusters"
              icon={<FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-accent" />}
            />
            <TagCloud tags={tam.geographic_clusters} variant="accent" />
          </div>
        )}

        {tam.regional_differences && (
          <KeyValueBlock
            label="Regional Differences"
            value={getText(tam.regional_differences, "—")}
          />
        )}
      </div>
    </SectionWrapper>
  );
};
