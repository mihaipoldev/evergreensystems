"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../types";
import { ConfidenceBadge, SourcesUsedSection, StatCard } from "../shared";
import { ResearchLinksSection } from "../niche-intelligence/sections/ResearchLinksSection";
import {
  TitlePacksSection,
  TargetProfileSection,
  PositioningSection,
  BuyerPsychologySection,
  MessagingStrategySection,
  ObjectionHandlingSection,
  SegmentationRulesSection,
  TargetingStrategySection,
  EnrichmentRequirementsSection,
  TechnographicSignalsSection,
  BehavioralSignalsSection,
  DiscoverySection,
  DemoSection,
  PilotSection,
  ProofPackageSection,
} from "./sections";

interface OutboundStrategyReportProps {
  data: ReportData;
  reportId: string;
}

export const OutboundStrategyReport = ({ data, reportId }: OutboundStrategyReportProps) => {
  const confidence = data.meta.confidence ?? 0;
  const confidenceRationale = data.meta.confidence_rationale as string | undefined;
  const dataAny = data.data as Record<string, unknown>;
  const messaging = (dataAny.messaging ?? {}) as Record<string, unknown>;
  const targetProfile = dataAny.target_profile as { employee_count?: string; company_revenue?: string } | undefined;
  const hasTopCards = targetProfile && (targetProfile.employee_count || targetProfile.company_revenue);

  return (
    <>
      {hasTopCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {targetProfile.employee_count && (
            <StatCard
              label="Employee count"
              value={targetProfile.employee_count}
              icon={<FontAwesomeIcon icon={faUsers} className="w-4 h-4" />}
            />
          )}
          {targetProfile.company_revenue && (
            <StatCard
              label="Company revenue"
              value={targetProfile.company_revenue}
              icon={<FontAwesomeIcon icon={faDollarSign} className="w-4 h-4" />}
            />
          )}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <ConfidenceBadge value={confidence} rationale={confidenceRationale} />
      </motion.div>

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
      {dataAny.title_packs && (
        <TitlePacksSection titlePacks={dataAny.title_packs as Parameters<typeof TitlePacksSection>[0]["titlePacks"]} sectionNumber="05" />
      )}
      {dataAny.technographic_signals && (
        <TechnographicSignalsSection technographicSignals={dataAny.technographic_signals as Parameters<typeof TechnographicSignalsSection>[0]["technographicSignals"]} sectionNumber="06" />
      )}
      {dataAny.behavioral_signals && (
        <BehavioralSignalsSection behavioralSignals={dataAny.behavioral_signals as string[]} sectionNumber="07" />
      )}
      {dataAny.positioning && (
        <PositioningSection positioning={dataAny.positioning as Parameters<typeof PositioningSection>[0]["positioning"]} sectionNumber="08" />
      )}
      {messaging.buyer_psychology && (
        <BuyerPsychologySection buyerPsychology={messaging.buyer_psychology as Parameters<typeof BuyerPsychologySection>[0]["buyerPsychology"]} sectionNumber="09" />
      )}
      {messaging.common_objections && (
        <ObjectionHandlingSection objectionHandling={{ common_objections: messaging.common_objections as Parameters<typeof ObjectionHandlingSection>[0]["objectionHandling"]["common_objections"] }} sectionNumber="10" />
      )}
      {messaging.personalization_vectors && (
        <MessagingStrategySection messagingStrategy={{ personalization_vectors: messaging.personalization_vectors as Parameters<typeof MessagingStrategySection>[0]["messagingStrategy"]["personalization_vectors"] }} sectionNumber="11" />
      )}
      {dataAny.discovery && (
        <DiscoverySection discovery={dataAny.discovery as Parameters<typeof DiscoverySection>[0]["discovery"]} sectionNumber="12" />
      )}
      {dataAny.demo && (
        <DemoSection demo={dataAny.demo as Parameters<typeof DemoSection>[0]["demo"]} sectionNumber="13" />
      )}
      {dataAny.pilot && (
        <PilotSection pilot={dataAny.pilot as Parameters<typeof PilotSection>[0]["pilot"]} sectionNumber="14" />
      )}
      {dataAny.proof_package && (
        <ProofPackageSection proofPackage={dataAny.proof_package as Parameters<typeof ProofPackageSection>[0]["proofPackage"]} sectionNumber="15" />
      )}
      {dataAny.research_links && (
        <ResearchLinksSection
          researchLinks={dataAny.research_links as Parameters<typeof ResearchLinksSection>[0]["researchLinks"]}
          reportId={reportId}
          sectionNumber="16"
        />
      )}
      {data.meta.sources_used && data.meta.sources_used.length > 0 && (
        <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
      )}
    </>
  );
};
