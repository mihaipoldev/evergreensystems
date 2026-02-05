"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard, type StatCardVariant } from "../../shared/StatCard";
import { DimensionScoreBar } from "../../shared/DimensionScoreBar";
import {
  getFitScoreLabel,
  getFitScoreBadgeClasses,
} from "../../../../shared/utils/fitScoreColors";
import type { FitScoreCategory } from "../../../../shared/utils/fitScoreColors";
import type { ReportData } from "../../../types";

interface QuantitativeSummarySectionProps {
  data: ReportData;
  sectionNumber: string;
}

function getCategoryFromRecommendation(rec: string): FitScoreCategory {
  const r = String(rec || "").toLowerCase();
  if (r === "pursue") return "pursue";
  if (r === "test") return "test";
  if (r === "caution") return "caution";
  if (r === "avoid") return "avoid";
  if (r === "ideal") return "ideal";
  return "test";
}

function getVariantFromRecommendation(rec: string): StatCardVariant {
  if (!rec?.trim()) return "default";
  const cat = getCategoryFromRecommendation(rec);
  if (cat === "ideal") return "ideal";
  if (cat === "pursue") return "green";
  if (cat === "test") return "warning";
  if (cat === "caution") return "caution";
  if (cat === "avoid") return "danger";
  return "default";
}

function getDimmedVariantFromRecommendation(rec: string): StatCardVariant {
  if (!rec?.trim()) return "default";
  const cat = getCategoryFromRecommendation(rec);
  if (cat === "ideal") return "ideal-dimmed";
  if (cat === "pursue") return "green-dimmed";
  if (cat === "test") return "warning-dimmed";
  if (cat === "caution") return "caution-dimmed";
  if (cat === "avoid") return "danger-dimmed";
  return "default";
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  if (!recommendation?.trim()) return null;
  const category = getCategoryFromRecommendation(recommendation);
  const label = getFitScoreLabel(category);
  const classes = getFitScoreBadgeClasses(category);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function extractScore(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "score" in val) {
    return Number((val as { score?: number }).score ?? 0);
  }
  return 0;
}

export const QuantitativeSummarySection = ({
  data,
  sectionNumber,
}: QuantitativeSummarySectionProps) => {
  const dataAny = data.data as Record<string, unknown>;
  const payload = Array.isArray(dataAny) ? (dataAny as unknown[])[0] : dataAny;
  const payloadObj = payload as Record<string, unknown> | null;

  const quantSummary = payloadObj?.quantitative_summary as Record<string, unknown> | undefined;
  if (!quantSummary) return null;

  const scoreAnalysis = quantSummary.score_analysis as Record<string, unknown> | undefined;
  const confidenceAnalysis = quantSummary.confidence_analysis as Record<
    string,
    unknown
  > | undefined;
  const dimensionBreakdown = quantSummary.dimension_breakdown as Record<
    string,
    Record<string, unknown>
  > | undefined;

  const decisionCard = payloadObj?.decision_card as Record<string, unknown> | undefined;
  const finalRec =
    String(decisionCard?.recommendation ?? decisionCard?.verdict ?? "").trim() || "";

  const individualEvals = payloadObj?.individual_evaluations as Record<
    string,
    Record<string, unknown>
  > | undefined;
  const getAgentRec = (agent: Record<string, unknown> | undefined) => {
    if (!agent) return "";
    const fv = agent.final_verdict as Record<string, unknown> | undefined;
    return String(agent.recommendation ?? fv?.recommendation ?? "").trim();
  };
  const agentRecs = [
    getAgentRec(individualEvals?.agent_1 as Record<string, unknown> | undefined),
    getAgentRec(individualEvals?.agent_2 as Record<string, unknown> | undefined),
    getAgentRec(individualEvals?.agent_3 as Record<string, unknown> | undefined),
  ];

  return (
    <SectionWrapper
      id="quantitative-summary"
      number={sectionNumber}
      title="Quantitative Summary"
      subtitle="Score distribution, confidence, and dimension agreement analysis"
    >
      <div className="space-y-8">
        {scoreAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scoreAnalysis.median != null && (
                <StatCard
                  label="Final Score"
                  value={String(scoreAnalysis.median)}
                  description={
                    confidenceAnalysis?.consensus != null || confidenceAnalysis?.median != null
                      ? `${String(confidenceAnalysis.consensus ?? confidenceAnalysis.median)}% confidence`
                      : undefined
                  }
                  icon={<FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />}
                  variant={getVariantFromRecommendation(finalRec)}
                  badge={finalRec ? <RecommendationBadge recommendation={finalRec} /> : undefined}
                />
              )}
              {Array.isArray(scoreAnalysis.individual_scores) &&
                (scoreAnalysis.individual_scores as number[]).map((s, i) => {
                  const confScores = confidenceAnalysis?.individual_scores as number[] | undefined;
                  const conf = Array.isArray(confScores) && confScores[i] != null ? confScores[i] : null;
                  const rec = agentRecs[i] ?? "";
                  return (
                    <StatCard
                      key={i}
                      label={`Agent ${i + 1}`}
                      value={String(s)}
                      description={conf != null ? `${conf}% confidence` : undefined}
                      icon={<FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />}
                      variant={getDimmedVariantFromRecommendation(finalRec)}
                      badge={rec ? <RecommendationBadge recommendation={rec} /> : undefined}
                    />
                  );
                })}
            </div>
          </motion.div>
        )}

        {dimensionBreakdown && Object.keys(dimensionBreakdown).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-accent" />
              Dimension Breakdown
            </h3>
            <div className="rounded-lg border border-border bg-card p-5 md:p-6 report-shadow space-y-6">
              {Object.entries(dimensionBreakdown).map(([dimName, dimData]) => {
                const d = dimData as Record<string, unknown>;
                const scores = d.scores as unknown[] | undefined;
                const median = d.median as { score?: number } | number | undefined;
                const scoresArr = Array.isArray(scores) ? (scores as unknown[]) : [];
                const scoreVal =
                  typeof median === "object" && median && "score" in median && (median as { score?: number }).score != null
                    ? (median as { score: number }).score
                    : typeof median === "number"
                      ? median
                      : scoresArr.length > 0
                        ? scoresArr.reduce((sum: number, s: unknown) => sum + extractScore(s), 0) / scoresArr.length
                        : 0;

                return (
                  <DimensionScoreBar key={dimName} label={dimName} score={scoreVal} />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
};
