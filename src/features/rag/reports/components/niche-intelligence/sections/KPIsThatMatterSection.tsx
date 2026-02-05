"use client";

import {
  SectionWrapper,
  ContentCard,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

interface PrimaryMetric {
  kpi?: string;
  benchmark?: string;
  why_it_matters?: string;
}

interface KPIsThatMatter {
  primary_metrics?: PrimaryMetric[];
}

interface KPIsThatMatterSectionProps {
  data: KPIsThatMatter;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const KPIsThatMatterSection = ({
  data,
  sectionNumber = "13",
}: KPIsThatMatterSectionProps) => {
  return (
    <SectionWrapper
      id="kpis-that-matter"
      number={sectionNumber}
      title="KPIs That Matter"
      subtitle="Primary metrics and benchmarks"
    >
      {data.primary_metrics && data.primary_metrics.length > 0 ? (
        <div className="space-y-4">
          <BlockHeader
            variant="title"
            title="Primary Metrics"
            icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-accent" />}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.primary_metrics.map((metric, index) => (
              <ContentCard
                key={index}
                variant="default"
                title={getText(metric.kpi, `KPI ${index + 1}`)}
                titleVariant="title"
              >
                {metric.benchmark && (
                  <p className="text-sm font-body text-foreground mb-2">
                    <span className="font-medium">Benchmark: </span>
                    {getText(metric.benchmark, "")}
                  </p>
                )}
                {metric.why_it_matters && (
                  <p className="text-sm font-body text-muted-foreground">
                    <span className="font-medium text-foreground">Why it matters: </span>
                    {getText(metric.why_it_matters, "")}
                  </p>
                )}
              </ContentCard>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body">No KPIs available</p>
      )}
    </SectionWrapper>
  );
};
