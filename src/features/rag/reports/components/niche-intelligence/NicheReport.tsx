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
import {
  BasicProfileSection,
  TamAnalysisSection,
  WhatTheySellSection,
  DealEconomicsSection,
  ClientAcquisitionDynamicsSection,
  ShadowCompetitorsSection,
  FinancialRealitySection,
  MarketMaturitySection,
  PainPointsSection,
  DesiredOutcomesSection,
  KPIsThatMatterSection,
  HowTheyPositionSection,
  TheirCustomerLanguageSection,
  BuyerPsychologySection,
  ResearchLinksSection,
} from "./sections";

interface NicheReportProps {
  data: ReportData;
  reportId: string;
}

export const NicheReport = ({ data, reportId }: NicheReportProps) => {
  const geo = data.meta.input.geo || "—";
  const confidence = data.meta.confidence || 0;

  const metaAny = data.meta as Record<string, unknown>;
  const focus = (metaAny?.focus as string) || "—";
  const marketValue = (metaAny?.market_value as string) || "—";

  const dataAny = data.data as Record<string, unknown>;
  const basicProfile = dataAny?.basic_profile as Record<string, unknown> | undefined;
  const tamAnalysis = dataAny?.tam_analysis as Record<string, unknown> | undefined;
  const marketValueFromProfile = basicProfile?.market_value as string | undefined;
  const tam = tamAnalysis?.total_companies_in_geography as number | undefined;

  const displayMarketValue = marketValueFromProfile || marketValue || "—";
  const displayTam = tam != null ? tam.toLocaleString() : "—";

  const isDescriptiveFormat = basicProfile != null;

  if (!isDescriptiveFormat) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
        <p className="font-body text-muted-foreground">
          No report data available. This report may use a format that is not yet supported.
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
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <StatCard
          label="Geography"
          value={geo}
          icon={<FontAwesomeIcon icon={faBullseye} className="w-4 h-4" />}
        />
        <StatCard
          label="Market Value"
          value={displayMarketValue && String(displayMarketValue).trim() ? String(displayMarketValue) : "—"}
          icon={<FontAwesomeIcon icon={faChartLine} className="w-4 h-4" />}
        />
        <StatCard
          label="TAM"
          value={displayTam}
          icon={<FontAwesomeIcon icon={faChartLine} className="w-4 h-4" />}
        />
        <StatCard
          label="Focus"
          value={focus}
          icon={<FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />}
        />
      </motion.div>

      <ConfidenceBadge value={confidence} />

      {basicProfile && <BasicProfileSection profile={basicProfile} sectionNumber="01" />}
      {tamAnalysis && <TamAnalysisSection tam={tamAnalysis} sectionNumber="02" />}
      {dataAny?.what_they_sell && <WhatTheySellSection data={dataAny.what_they_sell as Record<string, unknown>} sectionNumber="03" />}
      {dataAny?.deal_economics && <DealEconomicsSection data={dataAny.deal_economics as Record<string, unknown>} sectionNumber="04" />}
      {dataAny?.client_acquisition_dynamics && (
        <ClientAcquisitionDynamicsSection data={dataAny.client_acquisition_dynamics as Record<string, unknown>} sectionNumber="05" />
      )}
      {dataAny?.shadow_competitors && (
        <ShadowCompetitorsSection data={dataAny.shadow_competitors as Record<string, unknown>} sectionNumber="06" />
      )}
      {dataAny?.financial_reality && (
        <FinancialRealitySection data={dataAny.financial_reality as Record<string, unknown>} sectionNumber="07" />
      )}
      {dataAny?.market_maturity && (
        <MarketMaturitySection data={dataAny.market_maturity as Record<string, unknown>} sectionNumber="08" />
      )}
      {dataAny?.pain_points && <PainPointsSection data={dataAny.pain_points as Record<string, unknown>} sectionNumber="09" />}
      {dataAny?.desired_outcomes && (
        <DesiredOutcomesSection data={dataAny.desired_outcomes as Record<string, unknown>} sectionNumber="10" />
      )}
      {dataAny?.kpis_that_matter && (
        <KPIsThatMatterSection data={dataAny.kpis_that_matter as Record<string, unknown>} sectionNumber="11" />
      )}
      {dataAny?.how_they_position && (
        <HowTheyPositionSection data={dataAny.how_they_position as Record<string, unknown>} sectionNumber="12" />
      )}
      {dataAny?.their_customer_language && (
        <TheirCustomerLanguageSection data={dataAny.their_customer_language as Record<string, unknown>} sectionNumber="13" />
      )}
      {dataAny?.buyer_psychology && (
        <BuyerPsychologySection buyer={dataAny.buyer_psychology as Record<string, unknown>} sectionNumber="14" />
      )}
      {dataAny?.research_links && (
        <ResearchLinksSection
          researchLinks={dataAny.research_links as NonNullable<ReportData["data"]["research_links"]>}
          reportId={reportId}
          sectionNumber="15"
        />
      )}
      {data.meta.sources_used && data.meta.sources_used.length > 0 && (
        <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
      )}
    </>
  );
};
