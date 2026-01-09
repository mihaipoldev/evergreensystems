"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faChartLine,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import type { ReportData } from "../../../types";
import {
  getFitScoreCategory,
  getFitScoreColorClasses,
  type FitScoreCategory,
} from "../../../../shared/utils/fitScoreColors";

interface IndividualScoresSectionProps {
  data: ReportData;
  sectionNumber: string;
}

/**
 * Returns gradient classes for card background based on fit score category
 * Uses fit score colors with gradient styling and dark mode support
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
  const svgSize = 140;
  const center = svgSize / 2;
  
  const category = getFitScoreCategory(numericScore, null);
  const colorClasses = getFitScoreColorClasses(category);

  return (
    <div className="relative inline-block" style={{ width: svgSize, height: svgSize }}>
      <svg className="transform -rotate-90" style={{ width: svgSize, height: svgSize }}>
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
          style={{
            strokeDasharray: circumference,
          }}
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
          <div className={`text-4xl font-display font-bold ${colorClasses}`}>
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

export const IndividualScoresSection = ({ data, sectionNumber }: IndividualScoresSectionProps) => {
  const dataAny = data.data as any;
  // Handle array structure - get first element if it's an array
  const evaluationData = Array.isArray(dataAny) ? dataAny[0] : (dataAny.evaluation || dataAny);
  
  // Get score_details from evaluation data
  const scoreDetails = evaluationData?.score_details;

  // Get individual_scores from score_details
  const individualScores = scoreDetails?.individual_scores;

  if (!individualScores) {
    return null;
  }

  // Get stats from score_details
  const stdDev = scoreDetails?.score_spread ?? 0;
  const rawAverage = scoreDetails?.raw_average ?? 0;
  const adjustedAverage = scoreDetails?.adjusted_average ?? 0;

  // Extract models using new structure (agent1, agent2, agent3)
  const models = [
    { key: "agent1", data: individualScores.agent1 },
    { key: "agent2", data: individualScores.agent2 },
    { key: "agent3", data: individualScores.agent3 },
  ].filter((model) => model.data);

  if (models.length === 0) {
    return null;
  }

  return (
    <SectionWrapper
      id="individual-scores"
      number={sectionNumber}
      title="Individual Model Scores"
      subtitle="Multi-model AI evaluation with consensus scoring and variance analysis"
    >
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Raw Average"
          value={rawAverage.toFixed(1)}
          icon={<FontAwesomeIcon icon={faCalculator} className="w-5 h-5" />}
        />
        <StatCard
          label="Adjusted Average"
          value={adjustedAverage.toFixed(1)}
          icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Standard Deviation"
          value={stdDev.toFixed(1)}
          icon={<FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />}
        />
      </div>

      {/* Model Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {models.map((model, index) => {
          const scoreData = model.data;
          const rawScore = Number(scoreData.raw) || 0;
          const adjustedScore = Number(scoreData.adjusted) || 0;
          const verdict = scoreData.verdict || "";
          const agentName = scoreData.agent || scoreData.role || "Evaluator";
          const modelName = scoreData.model || "";
          
          // Always use raw score for display
          const displayScore = rawScore;
          const category = getFitScoreCategory(rawScore, null);
          
          // Get gradient based on fit score category
          const gradient = getCardGradientClasses(category);

          return (
            <motion.div
              key={model.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`bg-gradient-to-br ${gradient} rounded-xl p-6 border report-shadow hover:shadow-lg transition-all duration-300`}
            >
              {/* Model Header */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-display font-semibold text-foreground mb-1">
                  {agentName}
                </h3>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                  {modelName || "AI Evaluator"}
                </p>
              </div>

              {/* Score Gauge */}
              <div className="flex justify-center mb-6">
                <ScoreGauge score={displayScore} />
              </div>

              {/* Verdict */}
              {verdict && (
                <div className="bg-card/30 rounded-lg p-4 border border-border/50">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-2">
                    Verdict
                  </p>
                  <p className="text-sm font-body leading-relaxed text-foreground">
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

