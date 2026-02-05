"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faCalendar,
  faTriangleExclamation,
  faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import {
  SectionWrapper,
  StatCard,
  BlockHeader,
  ContentCard,
  InsightList,
} from "../../shared";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

interface DataQualitySectionProps {
  data: ReportData;
}

export const DataQualitySection = ({ data }: DataQualitySectionProps) => {
  const quality = (data.meta as { data_quality?: { overall_confidence?: number; sources_total?: number; next_refresh_recommended?: string; confidence_methodology?: string; known_limitations?: string[] } }).data_quality;

  if (!quality) {
    return (
      <SectionWrapper id="data-quality" number="06" title="Data Quality & Sources" subtitle="Research methodology, sources used, and known limitations">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="data-quality"
      number="06"
      title="Data Quality & Sources"
      subtitle="Research methodology, sources used, and known limitations"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Overall Confidence"
          value={typeof quality.overall_confidence === "number" ? `${(quality.overall_confidence * 100).toFixed(0)}%` : "—"}
          icon={<FontAwesomeIcon icon={faDatabase} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Sources Total"
          value={quality.sources_total ?? "—"}
          icon={<FontAwesomeIcon icon={faExternalLink} className="w-5 h-5" />}
        />
        <StatCard
          label="Next Refresh"
          value={quality.next_refresh_recommended ?? "—"}
          icon={<FontAwesomeIcon icon={faCalendar} className="w-5 h-5" />}
        />
      </div>

      <div className="mb-8">
        <ContentCard variant="muted" style="summary" title="Confidence Methodology">
          <p className="text-sm font-body text-foreground leading-relaxed">
            {quality.confidence_methodology ?? "—"}
          </p>
        </ContentCard>
      </div>

      <div>
        <BlockHeader
          variant="title"
          title="Known Limitations"
          icon={<FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-amber-500" />}
        />
        <InsightList items={quality.known_limitations ?? []} type="warning" numbered />
      </div>
    </SectionWrapper>
  );
};
