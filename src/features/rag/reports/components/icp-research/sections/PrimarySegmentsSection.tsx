"use client";

import {
  SectionWrapper,
  TagCloud,
  BlockHeader,
  ContentCard,
  KeyValueBlock,
  InsightList,
} from "../../shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ReportData } from "../../../types";

const priorityBadgeClass = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-accent text-accent-foreground";
const NO_DATA = "No data";

type PrimarySegmentsSectionProps = { data: ReportData; noWrapper?: boolean };

type PrimarySegment = {
  name: string;
  priority: string | number;
  description: string;
  deal_economics: { typical_deal_size: string; sales_cycle: string; close_rate_vs_average: string };
  typical_profile: { employee_count?: string; revenue_range?: string; industries?: string[]; [k: string]: unknown };
  how_to_identify?: { required_signals?: string[]; supporting_signals?: string[] };
  timing?: { best_window?: string; still_viable?: string; urgency_fades?: string };
  why_they_buy?: string;
  best_angles?: string[];
  [k: string]: unknown;
};

export const PrimarySegmentsSection = ({ data, noWrapper }: PrimarySegmentsSectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: { segments?: { assignment_logic?: { method?: string; rules?: string[] }; primary?: PrimarySegment[] } } })?.buyer_icp;
  const segments = buyerIcp?.segments;
  if (!segments?.primary?.length) {
    const empty = <p className="font-body text-muted-foreground">{NO_DATA}</p>;
    if (noWrapper) return <div className="mb-10">{empty}</div>;
    return (
      <SectionWrapper id="primary-segments" number="2.1" title="Primary Segments" subtitle="Highest-priority customer segments">
        {empty}
      </SectionWrapper>
    );
  }

  const content = (
    <>
      <div className="mb-8">
        <BlockHeader
          variant="title"
          title="Segment Assignment Logic"
          subtitle="How prospects are matched to segments"
        />
        <p className="text-sm font-body text-foreground mb-3">
          <strong>Method:</strong> {segments.assignment_logic?.method?.replace(/_/g, " ") ?? "—"}
        </p>
        <InsightList items={(segments.assignment_logic?.rules ?? []).slice(0, 3)} type="default" />
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {segments.primary.map((segment, index) => (
          <AccordionItem
            key={segment.name}
            value={segment.name}
            className="bg-card rounded-xl border border-border report-shadow-lg overflow-hidden"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 w-full text-left">
                <span className={priorityBadgeClass}>
                  {segment.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-display font-semibold text-foreground">
                    {segment.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5 line-clamp-1">
                    {segment.description.slice(0, 120)}…
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-5 pt-0 space-y-6 border-t border-border">
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {segment.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KeyValueBlock label="Deal Size" value={segment.deal_economics.typical_deal_size} />
                  <KeyValueBlock label="Sales Cycle" value={segment.deal_economics.sales_cycle.split(" (")[0]} />
                  <KeyValueBlock label="Close Rate" value={segment.deal_economics.close_rate_vs_average.split(" - ")[0]} />
                </div>

                <div>
                  <BlockHeader variant="label" title="Typical Profile" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <KeyValueBlock label="Employees" value={segment.typical_profile.employee_count} />
                    <KeyValueBlock label="Revenue" value={segment.typical_profile.revenue_range} />
                    {"funding_stage" in segment.typical_profile && (
                      <KeyValueBlock label="Funding" value={segment.typical_profile.funding_stage as string} />
                    )}
                    {"geographic_concentration" in segment.typical_profile && (
                      <KeyValueBlock label="Geography" value={segment.typical_profile.geographic_concentration as string} />
                    )}
                  </div>
                  <BlockHeader variant="label" title="Industries" />
                  <TagCloud tags={segment.typical_profile.industries ?? []} variant="accent" />
                </div>

                <div>
                  <BlockHeader variant="label" title="How to Identify" />
                  <div className="space-y-4">
                    <div>
                      <BlockHeader variant="label" title="Required Signals" />
                      <InsightList items={segment.how_to_identify?.required_signals ?? []} type="accent" />
                    </div>
                    <div>
                      <BlockHeader variant="label" title="Supporting Signals" />
                      <InsightList items={(segment.how_to_identify?.supporting_signals ?? []).slice(0, 4)} type="default" />
                    </div>
                  </div>
                </div>

                <div>
                  <BlockHeader variant="label" title="Timing Windows" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ContentCard variant="green" style="summary" title="Best Window">
                      {segment.timing?.best_window ?? "—"}
                    </ContentCard>
                    <ContentCard variant="warning" style="summary" title="Still Viable">
                      {segment.timing?.still_viable ?? "—"}
                    </ContentCard>
                    <ContentCard variant="danger" style="summary" title="Urgency Fades">
                      {segment.timing?.urgency_fades ?? "—"}
                    </ContentCard>
                  </div>
                </div>

                <ContentCard variant="primary" style="summary" title="Why They Buy">
                  <p className="text-sm font-body text-primary-foreground leading-relaxed">
                    {segment.why_they_buy}
                  </p>
                </ContentCard>

                <div>
                  <BlockHeader variant="label" title="Best Angles" />
                  <TagCloud
                    tags={(segment.best_angles ?? []).map((a) => String(a).replace(/_/g, " "))}
                    variant="outline"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );

  if (noWrapper) {
    return (
      <div className="mb-10">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Primary Segments</h3>
        {content}
      </div>
    );
  }

  return (
    <SectionWrapper
      id="primary-segments"
      number="2.1"
      title="Primary Segments"
      subtitle="High-priority customer segments ranked by fit and deal economics"
    >
      {content}
    </SectionWrapper>
  );
};
