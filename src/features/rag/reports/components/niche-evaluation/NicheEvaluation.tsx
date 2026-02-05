"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../types";
import { ConfidenceBadge } from "../shared/ConfidenceBadge";
import {
  SynthesisSection,
  ConcernsOpportunitiesSection,
  IndividualScoresSection,
  ExecutiveSummarySection,
  MetaSynthesisSection,
  QuantitativeSummarySection,
  IndividualAgentEvaluationsSection,
} from "./sections";
import { SourcesUsedSection } from "../shared/SourcesUsedSection";

interface NicheEvaluationProps {
  data: ReportData;
  reportId: string;
}

function getEvaluationData(data: ReportData) {
  const dataAny = data.data as Record<string, unknown>;
  const payload = Array.isArray(dataAny) ? (dataAny as unknown[])[0] : dataAny;
  const payloadObj = payload as Record<string, unknown> | null;
  const isNewFormat =
    payloadObj?.decision_card ?? payloadObj?.meta_synthesis ?? payloadObj?.individual_evaluations;
  if (isNewFormat) return { payload: payloadObj, isNewFormat: true };
  const evaluation = payloadObj?.evaluation ?? payloadObj;
  return { payload: evaluation as Record<string, unknown>, isNewFormat: false };
}

export const NicheEvaluation = ({ data, reportId }: NicheEvaluationProps) => {
  const { payload, isNewFormat } = getEvaluationData(data);

  // New format: decision_card
  const decisionCard = isNewFormat ? (payload?.decision_card as Record<string, unknown>) : null;
  const verdictLabel = decisionCard?.recommendation
    ? String(decisionCard.recommendation)
    : (payload?.verdict as { label?: string })?.label ?? "";
  const verdictScore = decisionCard?.score
    ? Number(decisionCard.score)
    : Number((payload?.verdict as { score?: number })?.score ?? 0);
  const verdictPriority = (payload?.verdict as { priority?: number })?.priority ?? 0;
  const verdictRecommendation = decisionCard?.verdict
    ? String(decisionCard.verdict)
    : (payload?.verdict as { recommendation?: string })?.recommendation ?? "";

  const confidenceObj = payload?.confidence as { average?: number } | number | undefined;
  const avgConfidence =
    typeof confidenceObj === "object" ? confidenceObj?.average ?? 0 : Number(confidenceObj ?? 0);
  const confidenceValue =
    avgConfidence > 0
      ? avgConfidence
      : decisionCard?.confidence != null
        ? Number(decisionCard.confidence)
        : data.meta.confidence ?? 0;

  const verdictConfig = {
    PURSUE: {
      icon: faCheckCircle,
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-700 dark:text-green-400",
      iconColor: "text-green-600 dark:text-green-500",
    },
    TEST: {
      icon: faExclamationTriangle,
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      textColor: "text-amber-700 dark:text-amber-400",
      iconColor: "text-amber-600 dark:text-amber-500",
    },
    CAUTION: {
      icon: faExclamationTriangle,
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-700 dark:text-orange-400",
      iconColor: "text-orange-600 dark:text-orange-500",
    },
    AVOID: {
      icon: faTimesCircle,
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-700 dark:text-red-400",
      iconColor: "text-red-600 dark:text-red-500",
    },
  };

  const evalVerdictLabel = String(verdictLabel).toUpperCase();
  const config = verdictConfig[evalVerdictLabel as keyof typeof verdictConfig] ?? verdictConfig.TEST;
  const Icon = config.icon;

  const showHeader = verdictLabel || verdictScore > 0 || verdictRecommendation;

  return (
    <>
      {/* Verdict Hero Card */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl p-4 md:p-6 border-2 ${config.bgColor} ${config.borderColor} mb-8 overflow-hidden`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center md:gap-4 gap-1">
            <div className={`p-1 md:p-4 rounded-full ${config.bgColor} flex-shrink-0`}>
              <FontAwesomeIcon icon={Icon} className={`w-8 h-8 md:w-10 md:h-10 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-2 md:gap-4 mb-2">
                <h2 className={`text-xl md:text-3xl font-display font-bold ${config.textColor} break-words`}>
                  {verdictLabel || "Evaluation"}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl md:text-4xl font-display font-bold ${config.textColor}`}>
                    {verdictScore.toFixed(0)}
                  </span>
                  <span className="text-sm md:text-lg text-muted-foreground">/100</span>
                </div>
              </div>
              <p className="text-sm md:text-base text-foreground font-body break-words">
                {verdictRecommendation}
              </p>
            </div>
            {verdictPriority > 0 && (
              <div className="hidden md:block text-right flex-shrink-0">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                  Priority Level
                </span>
                <span className={`text-2xl font-display font-semibold ${config.textColor}`}>
                  #{verdictPriority}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <ConfidenceBadge value={confidenceValue} />

      {isNewFormat ? (
        <>
          <ExecutiveSummarySection data={data} sectionNumber="01" />
          <IndividualScoresSection data={data} sectionNumber="02" reportId={reportId} />
          <MetaSynthesisSection data={data} sectionNumber="03" reportId={reportId} />
          <QuantitativeSummarySection data={data} sectionNumber="04" />
          <IndividualAgentEvaluationsSection data={data} sectionNumber="05" reportId={reportId} />
          {data.meta.sources_used && data.meta.sources_used.length > 0 && (
            <section id="research-sources" className="scroll-mt-8">
              <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
            </section>
          )}
        </>
      ) : (
        <>
          <SynthesisSection data={data} sectionNumber="01" />
          <ConcernsOpportunitiesSection data={data} sectionNumber="02" />
          <IndividualScoresSection data={data} sectionNumber="03" />
          {data.meta.sources_used && data.meta.sources_used.length > 0 && (
            <section id="research-sources" className="scroll-mt-8">
              <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
            </section>
          )}
        </>
      )}
    </>
  );
};
