"use client";

import { SectionWrapper } from "../../shared/SectionWrapper";
import { TargetingContent } from "./OpsOutputsSection";
import type { ReportData } from "../../../types";

type OpsOutputsShape = { targeting_quick_reference: unknown; exclusion_rules: string[] };

const NO_DATA = "No data";

interface TargetingCriteriaSectionProps {
  data: ReportData;
}

export const TargetingCriteriaSection = ({ data }: TargetingCriteriaSectionProps) => {
  const ops = (data.data as { ops_outputs?: OpsOutputsShape }).ops_outputs;

  if (!ops) {
    return (
      <SectionWrapper id="targeting-criteria" number="03" title="Targeting Criteria" subtitle="Firmographic filters, industry fit, technographic and behavioral signals, exclusion rules for list building">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="targeting-criteria"
      number="03"
      title="Targeting Criteria"
      subtitle="Firmographic filters, industry fit, technographic and behavioral signals, exclusion rules for list building"
    >
      <TargetingContent
        targeting={ops.targeting_quick_reference}
        exclusions={ops.exclusion_rules ?? []}
      />
    </SectionWrapper>
  );
};
