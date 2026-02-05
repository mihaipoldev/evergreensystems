"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faFileAlt,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../types";
import { StatCard, ConfidenceBadge, SourcesUsedSection } from "../shared";
import { ResearchLinksSection } from "../niche-intelligence/sections/ResearchLinksSection";
import {
  TitlePacksSection,
  TargetProfileSection,
  SalesProcessSection,
  OurPositioningSection,
  BuyerPsychologySection,
  MessagingStrategySection,
  ObjectionHandlingSection,
  SegmentationRulesSection,
  TargetingStrategySection,
  ExclusionRulesSection,
  EnrichmentRequirementsSection,
  TargetingQuickReferenceSection,
} from "./sections";

interface OutboundStrategyReportProps {
  data: ReportData;
  reportId: string;
}

export const OutboundStrategyReport = ({ data, reportId }: OutboundStrategyReportProps) => {
  const geo = data.meta.input.geo || "—";
  const confidence = data.meta.confidence || 0;
  const metaAny = data.meta as Record<string, unknown>;
  const focus = (metaAny?.focus as string) || "—";
  const marketValue = (metaAny?.market_value as string) || "—";

  const dataAny = data.data as Record<string, unknown>;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <StatCard
          label="Geography"
          value={geo}
          icon={<FontAwesomeIcon icon={faBullseye} className="w-4 h-4" />}
        />
        <StatCard
          label="Market Value"
          value={marketValue && String(marketValue).trim() ? String(marketValue) : "—"}
          icon={<FontAwesomeIcon icon={faChartLine} className="w-4 h-4" />}
        />
        <StatCard
          label="Focus"
          value={focus}
          icon={<FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />}
        />
      </motion.div>

      <ConfidenceBadge value={confidence} />

      {dataAny.target_profile && (
        <TargetProfileSection targetProfile={dataAny.target_profile as Parameters<typeof TargetProfileSection>[0]["targetProfile"]} sectionNumber="01" />
      )}
      {dataAny.targeting_strategy && (
        <TargetingStrategySection targetingStrategy={dataAny.targeting_strategy as Parameters<typeof TargetingStrategySection>[0]["targetingStrategy"]} sectionNumber="02" />
      )}
      {dataAny.enrichment_requirements && (
        <EnrichmentRequirementsSection enrichmentRequirements={dataAny.enrichment_requirements as Parameters<typeof EnrichmentRequirementsSection>[0]["enrichmentRequirements"]} sectionNumber="03" />
      )}
      {dataAny.segmentation_rules && (
        <SegmentationRulesSection segmentationRules={dataAny.segmentation_rules as Parameters<typeof SegmentationRulesSection>[0]["segmentationRules"]} sectionNumber="04" />
      )}
      {dataAny.exclusion_rules && (
        <ExclusionRulesSection exclusionRules={dataAny.exclusion_rules as Parameters<typeof ExclusionRulesSection>[0]["exclusionRules"]} sectionNumber="05" />
      )}
      {dataAny.title_packs && (
        <TitlePacksSection titlePacks={dataAny.title_packs as Parameters<typeof TitlePacksSection>[0]["titlePacks"]} sectionNumber="06" />
      )}
      {dataAny.targeting_quick_reference && (
        <TargetingQuickReferenceSection targetingQuickReference={dataAny.targeting_quick_reference as Parameters<typeof TargetingQuickReferenceSection>[0]["targetingQuickReference"]} sectionNumber="07" />
      )}
      {dataAny.our_positioning && (
        <OurPositioningSection ourPositioning={dataAny.our_positioning as Parameters<typeof OurPositioningSection>[0]["ourPositioning"]} sectionNumber="08" />
      )}
      {dataAny.buyer_psychology && (
        <BuyerPsychologySection buyerPsychology={dataAny.buyer_psychology as Parameters<typeof BuyerPsychologySection>[0]["buyerPsychology"]} sectionNumber="09" />
      )}
      {dataAny.objection_handling && (
        <ObjectionHandlingSection objectionHandling={dataAny.objection_handling as Parameters<typeof ObjectionHandlingSection>[0]["objectionHandling"]} sectionNumber="10" />
      )}
      {dataAny.messaging_strategy && (
        <MessagingStrategySection messagingStrategy={dataAny.messaging_strategy as Parameters<typeof MessagingStrategySection>[0]["messagingStrategy"]} sectionNumber="11" />
      )}
      {dataAny.sales_process && (
        <SalesProcessSection salesProcess={dataAny.sales_process as Parameters<typeof SalesProcessSection>[0]["salesProcess"]} sectionNumber="12" />
      )}
      {dataAny.research_links && (
        <ResearchLinksSection
          researchLinks={dataAny.research_links as Parameters<typeof ResearchLinksSection>[0]["researchLinks"]}
          reportId={reportId}
          sectionNumber="13"
        />
      )}
      {data.meta.sources_used && data.meta.sources_used.length > 0 && (
        <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
      )}
    </>
  );
};
