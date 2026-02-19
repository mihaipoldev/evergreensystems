"use client";

import { motion } from "framer-motion";
import type { ReportData } from "../../types";
import { ConfidenceBadge, SourcesUsedSection } from "../shared";
import type { OfferArchitectData } from "./types";
import {
  TargetMarketSection,
  WhatYouSellSection,
  OfferStructureSection,
  PricingArchitectureSection,
  GuaranteeDesignSection,
  ValuePropositionSection,
  OfferNamingSection,
  LeadMagnetSection,
  ObjectionHandlingSection,
  ProofRequirementsSection,
  SalesEnablementSection,
  OutreachStrategySection,
  CompetitiveDiffSection,
  ImplementationRoadmapSection,
} from "./sections";

interface OfferArchitectReportProps {
  data: ReportData;
  reportId: string;
}

export const OfferArchitectReport = ({
  data,
  reportId,
}: OfferArchitectReportProps) => {
  const confidence = data.meta.confidence || 0;
  const confidenceRationale = data.meta.confidence_rationale as
    | string
    | undefined;

  const d = data.data as OfferArchitectData;

  // Validate we have at least some data
  if (!d || Object.keys(d).length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
        <p className="font-body text-muted-foreground">
          No report data available. This report may use a format that is not yet
          supported.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <ConfidenceBadge value={confidence} rationale={confidenceRationale} />
      </motion.div>

      {d.target_market && (
        <TargetMarketSection data={d.target_market} sectionNumber="01" />
      )}
      {d.what_you_sell && (
        <WhatYouSellSection data={d.what_you_sell} sectionNumber="02" />
      )}
      {d.offer_structure && (
        <OfferStructureSection data={d.offer_structure} sectionNumber="03" />
      )}
      {d.pricing_architecture && (
        <PricingArchitectureSection
          data={d.pricing_architecture}
          sectionNumber="04"
        />
      )}
      {d.guarantee_design && (
        <GuaranteeDesignSection
          data={d.guarantee_design}
          sectionNumber="05"
        />
      )}
      {d.value_proposition && (
        <ValuePropositionSection
          data={d.value_proposition}
          sectionNumber="06"
        />
      )}
      {d.offer_naming_and_framing && (
        <OfferNamingSection
          data={d.offer_naming_and_framing}
          reportId={reportId}
          sectionNumber="07"
        />
      )}
      {d.lead_magnet_strategy && (
        <LeadMagnetSection
          data={d.lead_magnet_strategy}
          sectionNumber="08"
        />
      )}
      {d.objection_handling && (
        <ObjectionHandlingSection
          data={d.objection_handling}
          reportId={reportId}
          sectionNumber="09"
        />
      )}
      {d.proof_requirements && (
        <ProofRequirementsSection
          data={d.proof_requirements}
          sectionNumber="10"
        />
      )}
      {d.sales_enablement && (
        <SalesEnablementSection
          data={d.sales_enablement}
          sectionNumber="11"
        />
      )}
      {d.outreach_strategy && (
        <OutreachStrategySection
          data={d.outreach_strategy}
          reportId={reportId}
          sectionNumber="12"
        />
      )}
      {d.competitive_differentiation && (
        <CompetitiveDiffSection
          data={d.competitive_differentiation}
          sectionNumber="13"
        />
      )}
      {d.implementation_roadmap && (
        <ImplementationRoadmapSection
          data={d.implementation_roadmap}
          sectionNumber="14"
        />
      )}

      {data.meta.sources_used && data.meta.sources_used.length > 0 && (
        <SourcesUsedSection
          sources={data.meta.sources_used}
          reportId={reportId}
        />
      )}
    </>
  );
};
