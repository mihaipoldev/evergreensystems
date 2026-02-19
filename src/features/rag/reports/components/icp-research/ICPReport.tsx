"use client";

import type { ReportData } from "../../types";
import { SourcesUsedSection } from "../shared/SourcesUsedSection";
import { ICPHeader } from "./ICPHeader";
import {
  ICPSnapshotSection,
  TypicalCustomerTypesSection,
  TargetSegmentationSection,
  MarketSizingSection,
  TriggersSection,
  BuyingMotivationsAndJourneySection,
  CompetitiveContextSection,
} from "./sections";

interface ICPReportProps {
  data: ReportData;
  reportId: string;
}

export const ICPReport = ({ data, reportId }: ICPReportProps) => {
  const metaAny = data.meta as { data_quality?: { sources_used?: string[] }; sources_used?: string[] };
  const sources =
    (metaAny.data_quality?.sources_used?.length ?? 0) > 0
      ? metaAny.data_quality!.sources_used!
      : (data.meta.sources_used?.length ?? 0) > 0
        ? data.meta.sources_used!
        : [];

  return (
    <>
      <ICPHeader data={data} />
      <ICPSnapshotSection data={data} />
      <TypicalCustomerTypesSection data={data} />
      <TargetSegmentationSection data={data} />
      <MarketSizingSection data={data} />
      <TriggersSection data={data} />
      <BuyingMotivationsAndJourneySection data={data} />
      <CompetitiveContextSection data={data} />
      {sources.length > 0 && (
        <SourcesUsedSection sources={sources} reportId={reportId} />
      )}
    </>
  );
};
