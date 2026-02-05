"use client";

import {
  SectionWrapper,
  ContentCard,
  BlockHeader,
} from "../../shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

type SecondarySegmentsSectionProps = { data: ReportData; noWrapper?: boolean };

export const SecondarySegmentsSection = ({ data, noWrapper }: SecondarySegmentsSectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: { segments?: { secondary?: Array<{ name: string; description: string; why_secondary: string; when_to_pursue: string }> } } })?.buyer_icp;
  const segments = buyerIcp?.segments?.secondary ?? [];
  if (segments.length === 0) {
    const empty = <p className="font-body text-muted-foreground">{NO_DATA}</p>;
    if (noWrapper) return <div className="mb-10">{empty}</div>;
    return (
      <SectionWrapper id="secondary-segments" number="2.2" title="Secondary Segments" subtitle="Lower priority segments that may be viable under specific conditions">
        {empty}
      </SectionWrapper>
    );
  }

  const content = (
    <Accordion type="single" collapsible className="space-y-4">
      {segments.map((segment, index) => (
        <AccordionItem
          key={segment.name}
          value={segment.name}
          className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 w-full text-left">
              <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                S{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {segment.name}
                </h3>
                <p className="text-sm text-muted-foreground font-body mt-0.5 line-clamp-1">
                  {segment.description.slice(0, 100)}…
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-5 pt-5 space-y-6 border-t border-border">
              <p className="text-sm font-body text-foreground leading-relaxed">
                {segment.description}
              </p>

              <BlockHeader variant="label" title="Why Secondary" />
              <p className="text-sm font-body text-foreground leading-relaxed">
                {segment.why_secondary}
              </p>

              <BlockHeader variant="label" title="When to Pursue" />
              <p className="text-sm font-body text-foreground leading-relaxed">
                {segment.when_to_pursue}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  if (noWrapper) {
    return (
      <div className="mb-10">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Secondary Segments</h3>
        {content}
      </div>
    );
  }

  return (
    <SectionWrapper
      id="secondary-segments"
      number="2.2"
      title="Secondary Segments"
      subtitle="Lower priority segments that may be viable under specific conditions"
    >
      {content}
    </SectionWrapper>
  );
};
