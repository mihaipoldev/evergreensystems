"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper, ContentCard, BlockHeader } from "../../shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

type AvoidSegmentsSectionProps = { data: ReportData; noWrapper?: boolean };

export const AvoidSegmentsSection = ({ data, noWrapper }: AvoidSegmentsSectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: { segments?: { avoid?: Array<{ name: string; why_avoid: string; exception?: string }> } } })?.buyer_icp;
  const segments = buyerIcp?.segments?.avoid ?? [];
  if (segments.length === 0) {
    const empty = <p className="font-body text-muted-foreground">{NO_DATA}</p>;
    if (noWrapper) return <div className="mb-10">{empty}</div>;
    return (
      <SectionWrapper id="avoid-segments" number="2.3" title="Segments to Avoid" subtitle="Customer types that typically don't fit this niche's offering">
        {empty}
      </SectionWrapper>
    );
  }

  const content = (
    <Accordion type="single" collapsible className="space-y-4">
      {segments.map((segment) => (
        <AccordionItem
          key={segment.name}
          value={segment.name}
          className="bg-card rounded-xl border border-border report-shadow overflow-hidden border-l-4 border-l-red-500/60"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 w-full text-left">
              <span className="text-red-500 flex-shrink-0">
                <FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {segment.name}
                </h3>
                <p className="text-sm text-muted-foreground font-body mt-0.5 line-clamp-1">
                  {segment.why_avoid.slice(0, 80)}…
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-5 pt-5 space-y-6 border-t border-border">
              <div>
                <BlockHeader variant="label" title="Why Avoid" />
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {segment.why_avoid}
                </p>
              </div>

              {segment.exception && (
                <ContentCard variant="warning" style="summary" title="Exception">
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {segment.exception}
                  </p>
                </ContentCard>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  if (noWrapper) {
    return (
      <div className="mb-10">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Segments to Avoid</h3>
        {content}
      </div>
    );
  }

  return (
    <SectionWrapper
      id="avoid-segments"
      number="2.3"
      title="Segments to Avoid"
      subtitle="Customer types that typically don't fit this niche's offering"
    >
      {content}
    </SectionWrapper>
  );
};
