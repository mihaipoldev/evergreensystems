"use client";

import { motion } from "framer-motion";

interface FitScoreGaugeProps {
  score: number;
  label?: string;
  verdict?: "pursue" | "test" | "avoid";
}

export const FitScoreGauge = ({ score, label = "Lead Gen Fit Score", verdict }: FitScoreGaugeProps) => {
  const getScoreColor = (score: number, verdict?: "pursue" | "test" | "avoid") => {
    if (verdict === "pursue") return "text-green-600";
    if (verdict === "test") return "text-yellow-500";
    if (verdict === "avoid") return "text-red-600";
    // Fallback to score-based colors if no verdict
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-500";
    return "text-red-600";
  };

  const getProgressColor = (score: number, verdict?: "pursue" | "test" | "avoid") => {
    if (verdict === "pursue") return "text-green-600";
    if (verdict === "test") return "text-yellow-500";
    if (verdict === "avoid") return "text-red-600";
    // Fallback to score-based colors if no verdict
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-500";
    return "text-red-600";
  };

  const getScoreLabel = (score: number, verdict?: "pursue" | "test" | "avoid") => {
    if (verdict === "pursue") return "Excellent Fit";
    if (verdict === "test") return "Good Fit - Worth Testing";
    if (verdict === "avoid") return "Poor Fit";
    // Fallback to score-based labels if no verdict
    if (score >= 80) return "Excellent Fit";
    if (score >= 60) return "Good Fit - Worth Testing";
    if (score >= 40) return "Moderate Fit";
    return "Poor Fit";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl p-8 report-shadow-lg border border-border text-center"
    >
      <div className="relative inline-block mb-4 drop-shadow-sm">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getProgressColor(score, verdict)}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-3xl font-display font-bold ${getScoreColor(score, verdict)}`}
          >
            {score}
          </motion.span>
        </div>
      </div>

      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">
        {label}
      </h3>
      <p className={`text-lg font-display font-semibold ${getScoreColor(score, verdict)}`}>
        {getScoreLabel(score, verdict)}
      </p>
    </motion.div>
  );
};

