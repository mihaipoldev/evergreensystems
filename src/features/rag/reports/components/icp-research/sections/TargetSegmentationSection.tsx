"use client";

import { PrimarySegmentsSection } from "./PrimarySegmentsSection";
import { SecondarySegmentsSection } from "./SecondarySegmentsSection";
import { AvoidSegmentsSection } from "./AvoidSegmentsSection";
import type { ReportData } from "../../../types";

/**
 * Section 2: Target Segmentation.
 * Wraps Primary, Secondary, and Segments to Avoid for a single TOC entry (id: target-segmentation).
 */
interface TargetSegmentationSectionProps {
  data: ReportData;
}

export const TargetSegmentationSection = ({ data }: TargetSegmentationSectionProps) => {
  return (
    <section id="target-segmentation" className="scroll-mt-8 mb-16">
      <PrimarySegmentsSection data={data} />
      <SecondarySegmentsSection data={data} />
      <AvoidSegmentsSection data={data} />
    </section>
  );
};
