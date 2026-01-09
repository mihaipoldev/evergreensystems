"use client";

import { motion } from "framer-motion";

interface FitScoreGaugeProps {
  score: number;
  label?: string;
}

export const FitScoreGauge = ({ score, label = "Lead Gen Fit Score" }: FitScoreGaugeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
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
      className="bg-card rounded-xl p-8 shadow-lg border border-border text-center"
    >
      <div className="relative inline-block mb-4">
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
            className="text-accent"
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
            className={`text-3xl font-display font-bold ${getScoreColor(score)}`}
          >
            {score}
          </motion.span>
        </div>
      </div>

      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">
        {label}
      </h3>
      <p className={`text-lg font-display font-semibold ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </p>
    </motion.div>
  );
};
