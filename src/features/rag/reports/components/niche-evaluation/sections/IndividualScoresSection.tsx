"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { DimensionScoreBar } from "../../shared/DimensionScoreBar";
import type { ReportData } from "../../../types";
import { normalizeAgentEvaluation } from "../normalizeAgentEvaluation";
import {
  getFitScoreCategory,
  getFitScoreLabel,
  getFitScoreBadgeClasses,
  type FitScoreCategory,
} from "../../../../shared/utils/fitScoreColors";

interface IndividualScoresSectionProps {
  data: ReportData;
  sectionNumber: string;
  reportId?: string;
}

/**
 * Returns gradient classes for card background based on fit score category
 */
function getCardGradientClasses(category: FitScoreCategory): string {
  switch (category) {
    case "ideal":
      return "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/20";
    case "pursue":
      return "from-green-600/10 to-green-600/5 dark:from-green-600/10 dark:to-green-600/5 border-green-600/20 dark:border-green-600/20";
    case "test":
      return "from-yellow-600/10 to-yellow-600/5 dark:from-yellow-600/10 dark:to-yellow-600/5 border-yellow-600/20 dark:border-yellow-600/20";
    case "caution":
      return "from-orange-600/10 to-orange-600/5 dark:from-orange-600/10 dark:to-orange-600/5 border-orange-600/20 dark:border-orange-600/20";
    case "avoid":
      return "from-red-600/10 to-red-600/5 dark:from-red-600/10 dark:to-red-600/5 border-red-600/20 dark:border-red-600/20";
  }
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

function getRecommendationVerdictConfig(recommendation: string) {
  const r = String(recommendation || "").toUpperCase();
  if (r === "PURSUE") return "border-green-500/50";
  if (r === "TEST") return "border-amber-500/50";
  if (r === "CAUTION") return "border-orange-500/50";
  if (r === "AVOID") return "border-red-500/50";
  return "border-border";
}

function AgentConsensusCard({
  agent,
  index,
  allAgree,
  getRecommendationVerdictConfig,
  getCardGradientClasses,
  getFitScoreCategory,
}: {
  agent: { key: string; label: string; data: Record<string, unknown> };
  index: number;
  allAgree: boolean;
  getRecommendationVerdictConfig: (r: string) => string;
  getCardGradientClasses: (c: FitScoreCategory) => string;
  getFitScoreCategory: (s: number, _: null) => FitScoreCategory;
}) {
  const agentData = agent.data;
  const score = Number(agentData.overall_fit_score ?? 0);
  const confidence = Number(agentData.confidence_score ?? 0);
  const recommendation = String(agentData.recommendation ?? "");
  const oneLine = agentData.one_line_summary as string | undefined;
  const dimBreakdown = agentData.dimension_scores_breakdown as
    | Record<string, number | { score?: number }>
    | undefined;
  const category = getFitScoreCategory(score, null);
  const gradient = getCardGradientClasses(category);
  const borderClass = allAgree ? "ring-2 ring-green-500/30" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-4 md:p-6 border report-shadow overflow-hidden ${borderClass} ${getRecommendationVerdictConfig(recommendation)}`}
    >
      <div className="mb-4 text-center">
        <h3 className="text-lg font-display font-semibold text-foreground">
          {agent.label}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-2xl font-display font-bold">{score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          <span className="text-xs text-muted-foreground">
            • {confidence}% conf
          </span>
        </div>
        {recommendation && (
          <span
            className={`inline-flex items-center mt-2 rounded-full border px-2 py-0.5 text-xs font-semibold ${getFitScoreBadgeClasses(getCategoryFromRecommendation(recommendation))}`}
          >
            {getFitScoreLabel(getCategoryFromRecommendation(recommendation))}
          </span>
        )}
      </div>

      {dimBreakdown && (
        <div className="space-y-3 mb-4">
          {Object.entries(dimBreakdown).map(([dim, val]) => {
            const s = typeof val === "object" ? Number(val?.score ?? 0) : Number(val);
            return (
              <DimensionScoreBar
                key={dim}
                label={dim}
                score={s}
              />
            );
          })}
        </div>
      )}

      {oneLine && (
        <p className="text-xs text-muted-foreground font-body">
          {oneLine}
        </p>
      )}
    </motion.div>
  );
}

export const IndividualScoresSection = ({
  data,
  sectionNumber,
  reportId,
}: IndividualScoresSectionProps) => {
  const dataAny = data.data as Record<string, unknown>;
  const payload = Array.isArray(dataAny) ? (dataAny as unknown[])[0] : dataAny;
  const payloadObj = payload as Record<string, unknown> | null;

  const individualEvals = payloadObj?.individual_evaluations as Record<
    string,
    Record<string, unknown>
  > | undefined;

  if (!individualEvals || Object.keys(individualEvals).length === 0) return null;

  const agentsIncluded = (data.meta as Record<string, unknown>)?.analysis_summary as
    | { agents_included?: string[] }
    | undefined;
  const agentLabels = agentsIncluded?.agents_included ?? ["Agent 1", "Agent 2", "Agent 3"];
  const agentKeys = ["agent_1", "agent_2", "agent_3"] as const;
  const agents = agentKeys
    .map((key, i) => ({
      key,
      label: agentLabels[i] ?? `Agent ${i + 1}`,
      data: normalizeAgentEvaluation(individualEvals[key] as Record<string, unknown>) ?? individualEvals[key],
    }))
    .filter((a) => a.data);

  if (agents.length === 0) return null;

  const recommendations = agents
    .map((a) => String((a.data?.recommendation as string) ?? "").toUpperCase())
    .filter(Boolean);
  const allAgree =
    recommendations.length >= 2 &&
    recommendations.every((r) => r === recommendations[0]);

  return (
    <SectionWrapper
      id="agent-consensus"
      number={sectionNumber}
      title="Agent Consensus"
      subtitle="Multi-agent evaluation with dimension scores and recommendations"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
          <AgentConsensusCard
            key={agent.key}
            agent={agent}
            index={index}
            allAgree={allAgree}
            getRecommendationVerdictConfig={getRecommendationVerdictConfig}
            getCardGradientClasses={getCardGradientClasses}
            getFitScoreCategory={getFitScoreCategory}
          />
        ))}
      </div>
    </SectionWrapper>
  );
};
