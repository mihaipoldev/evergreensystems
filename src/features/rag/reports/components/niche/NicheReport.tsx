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

  return (
    <>
      <NicheProfileSection profile={data.data.niche_profile} />
      <MarketIntelligenceSection profile={data.data.niche_profile} />
      <BuyerPsychologySection buyer={data.data.buyer_psychology} />
      <ValueDynamicsSection value={data.data.value_dynamics} />
      <LeadGenStrategySection strategy={data.data.lead_gen_strategy} />
      <TargetingStrategySection targeting={data.data.lead_gen_strategy.targeting_strategy} />
      <OfferAnglesSection angles={data.data.generic_offer_angles} />
      <OutboundApproachSection outbound={data.data.outbound_approach} />
      <PositioningIntelSection positioning={data.data.positioning_intel} />
      <MessagingInputsSection messaging={data.data.messaging_inputs} />
      {data.data.research_links && (
        <ResearchLinksSection researchLinks={data.data.research_links} reportId={reportId} />
      )}
      {data.meta.sources_used && data.meta.sources_used.length > 0 && (
        <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
      )}
    </>
  );
};

