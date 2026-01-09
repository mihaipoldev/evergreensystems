"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullseye, 
  faFileAlt,
  faChartLine,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../types";
import {
  NicheProfileSection,
  MarketIntelligenceSection,
  BuyerPsychologySection,
  ValueDynamicsSection,
  LeadGenStrategySection,
  TargetingStrategySection,
  OfferAnglesSection,
  OutboundApproachSection,
  PositioningIntelSection,
  MessagingInputsSection,
  ResearchLinksSection,
  SourcesUsedSection,
} from "./sections";

interface NicheReportProps {
  data: ReportData;
  reportId: string;
}

export const NicheReport = ({ data, reportId }: NicheReportProps) => {
  // Extract data for header cards
  const geo = data.meta.input.geo || "—";
  const confidence = data.meta.confidence || 0;
  
  // Extract focus and market_value from meta (they may not be in the TypeScript type)
  const metaAny = data.meta as any;
  const focus = metaAny?.focus || "—";
  const marketValue = metaAny?.market_value || "—";
  
  // Extract TAM from niche_profile.tam_analysis
  const nicheProfileAny = data.data.niche_profile as any;
  const tam = nicheProfileAny?.tam_analysis?.total_companies_in_geography 
    ? nicheProfileAny.tam_analysis.total_companies_in_geography.toLocaleString()
    : "—";

  return (
    <>

      {/* Header Cards - 2x2 Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Geography
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">{geo}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Market Value
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {marketValue && marketValue.trim() ? marketValue : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              TAM
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {tam || "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Focus
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {focus || "—"}
          </p>
        </motion.div>
      </motion.div>

      {/* Confidence Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-semibold text-primary">
            {(confidence * 100).toFixed(0)}% Confidence
          </span>
        </div>
      </motion.div>

      <NicheProfileSection profile={data.data.niche_profile} sectionNumber="01" />
      <MarketIntelligenceSection profile={data.data.niche_profile} sectionNumber="02" />
      <BuyerPsychologySection buyer={data.data.buyer_psychology} sectionNumber="03" />
      <ValueDynamicsSection value={data.data.value_dynamics} sectionNumber="04" />
      <LeadGenStrategySection strategy={data.data.lead_gen_strategy} sectionNumber="05" />
      <TargetingStrategySection targeting={data.data.lead_gen_strategy.targeting_strategy} sectionNumber="06" />
      <OfferAnglesSection angles={data.data.generic_offer_angles} sectionNumber="07" />
      <OutboundApproachSection outbound={data.data.outbound_approach} sectionNumber="08" />
      <PositioningIntelSection positioning={data.data.positioning_intel} sectionNumber="09" />
      <MessagingInputsSection messaging={data.data.messaging_inputs} sectionNumber="10" />
      {data.data.research_links && (
        <ResearchLinksSection researchLinks={data.data.research_links} reportId={reportId} sectionNumber="11" />
      )}
      {data.meta.sources_used && data.meta.sources_used.length > 0 && (
        <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
      )}
    </>
  );
};

