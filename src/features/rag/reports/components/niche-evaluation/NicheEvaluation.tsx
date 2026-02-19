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
  IndividualScoresSection,
  ExecutiveSummarySection,
  MetaSynthesisSection,
  QuantitativeSummarySection,
} from "./sections";
import { SourcesUsedSection } from "../shared/SourcesUsedSection";

interface NicheEvaluationProps {
  data: ReportData;
  reportId: string;
}

export const NicheEvaluation = ({ data, reportId }: NicheEvaluationProps) => {
  const dataAny = data.data as Record<string, unknown>;
  const decisionCard = dataAny?.decision_card as Record<string, unknown> | undefined;

  const verdictLabel = decisionCard?.recommendation
    ? String(decisionCard.recommendation)
    : "";
  const verdictScore = decisionCard?.score
    ? Number(decisionCard.score)
    : 0;
  const verdictRecommendation = decisionCard?.verdict
    ? String(decisionCard.verdict)
    : "";

  const confidenceValue =
    decisionCard?.confidence != null
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
                  {verdictLabel || "—"}
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
          </div>
        </motion.div>
      )}

      <ConfidenceBadge
        value={confidenceValue}
        rationale={(data.meta as { confidence_rationale?: string })?.confidence_rationale}
      />

      <ExecutiveSummarySection data={data} sectionNumber="01" />
      <IndividualScoresSection data={data} sectionNumber="02" reportId={reportId} />
      <MetaSynthesisSection data={data} sectionNumber="03" reportId={reportId} />
      <QuantitativeSummarySection data={data} sectionNumber="04" reportId={reportId} />
      {data.meta.sources_used && data.meta.sources_used.length > 0 && (
        <section id="research-sources" className="scroll-mt-8">
          <SourcesUsedSection sources={data.meta.sources_used} reportId={reportId} />
        </section>
      )}
    </>
  );
};
