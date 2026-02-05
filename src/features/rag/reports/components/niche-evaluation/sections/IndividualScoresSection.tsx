"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faChartLine,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { DimensionScoreBar } from "../../shared/DimensionScoreBar";
import type { ReportData } from "../../../types";
import { normalizeAgentEvaluation } from "../../../utils/normalizeAgentEvaluation";
import {
  getFitScoreCategory,
  getFitScoreColorClasses,
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

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const numericScore = Math.max(0, Math.min(100, Number(score) || 0));
  const strokeDashoffset = circumference - (numericScore / 100) * circumference;
  const svgSize = 120;
  const center = svgSize / 2;

  const category = getFitScoreCategory(numericScore, null);
  const colorClasses = getFitScoreColorClasses(category);

  return (
    <div className="relative inline-block w-[120px] h-[120px] md:w-[140px] md:h-[140px]">
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        preserveAspectRatio="xMidYMid meet"
        className="transform -rotate-90 w-full h-full block"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted opacity-10"
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className={colorClasses}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className={`text-2xl md:text-4xl font-display font-bold ${colorClasses}`}>
            {Math.round(numericScore)}
          </div>
          <div className="text-xs text-muted-foreground font-body uppercase tracking-wider mt-1">
            Score
          </div>
        </motion.div>
      </div>
    </div>
  );
};

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

  if (individualEvals && Object.keys(individualEvals).length > 0) {
    const agents = [
      { key: "agent_1", label: "Agent 1", data: normalizeAgentEvaluation(individualEvals.agent_1 as Record<string, unknown>) ?? individualEvals.agent_1 },
      { key: "agent_2", label: "Agent 2", data: normalizeAgentEvaluation(individualEvals.agent_2 as Record<string, unknown>) ?? individualEvals.agent_2 },
      { key: "agent_3", label: "Agent 3", data: normalizeAgentEvaluation(individualEvals.agent_3 as Record<string, unknown>) ?? individualEvals.agent_3 },
    ].filter((a) => a.data);

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
  }

  const evaluationData = payloadObj?.evaluation ?? payloadObj;
  const scoreDetails = (evaluationData as Record<string, unknown>)?.score_details as
    | Record<string, unknown>
    | undefined;
  const individualScores = scoreDetails?.individual_scores as Record<
    string,
    Record<string, unknown>
  > | undefined;

  if (!individualScores) return null;

  const stdDev = Number(scoreDetails?.score_spread ?? scoreDetails?.std_dev ?? 0);
  const rawAverage = Number(scoreDetails?.raw_average ?? 0);
  const adjustedAverage = Number(scoreDetails?.adjusted_average ?? 0);

  const models = [
    { key: "agent1", data: individualScores.agent1 },
    { key: "agent2", data: individualScores.agent2 },
    { key: "agent3", data: individualScores.agent3 },
  ].filter((m) => m.data);

  if (models.length === 0) return null;

  return (
    <SectionWrapper
      id="individual-scores"
      number={sectionNumber}
      title="Individual Model Scores"
      subtitle="Multi-model AI evaluation with consensus scoring and variance analysis"
    >
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faCalculator} className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Raw Average</p>
            <p className="text-xl font-semibold">{rawAverage.toFixed(1)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Adjusted Average</p>
            <p className="text-xl font-semibold">{adjustedAverage.toFixed(1)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Standard Deviation</p>
            <p className="text-xl font-semibold">{stdDev.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models.map((model, index) => {
          const scoreData = model.data as Record<string, unknown>;
          const rawScore = Number(scoreData.raw) || 0;
          const verdict = String(scoreData.verdict ?? "");
          const agentName = String(scoreData.agent ?? scoreData.role ?? "Evaluator");
          const modelName = String(scoreData.model ?? "AI Evaluator");
          const category = getFitScoreCategory(rawScore, null);
          const gradient = getCardGradientClasses(category);

          return (
            <motion.div
              key={model.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`bg-gradient-to-br ${gradient} rounded-xl p-4 md:p-6 border report-shadow hover:shadow-lg transition-all duration-300 overflow-hidden`}
            >
              <div className="mb-4 md:mb-6 text-center">
                <h3 className="text-lg md:text-xl font-display font-semibold text-foreground mb-1 break-words">
                  {agentName}
                </h3>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider break-words">
                  {modelName}
                </p>
              </div>

              <div className="w-full flex items-center justify-center mb-4 md:mb-6">
                <ScoreGauge score={rawScore} />
              </div>

              {verdict && (
                <div className="p-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-2">
                    Verdict
                  </p>
                  <p className="text-sm font-body leading-relaxed text-foreground break-words">
                    {verdict}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};
