"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faUsers, faCheck } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import type { ReportData } from "../../../types";

interface ConsensusFlagsSectionProps {
  data: ReportData;
  sectionNumber: string;
}

const formatFlagName = (flag: string) => {
  return flag
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const categoryColors: Record<string, string> = {
  market_dynamics: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400",
  economics: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
  sales_process: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
  market_access: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
  operations: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
  fit_quality: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400",
  other: "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400",
};

export const ConsensusFlagsSection = ({ data, sectionNumber }: ConsensusFlagsSectionProps) => {
  // Extract flags from evaluation data
  // Check multiple possible locations: data.data.evaluation, data.data (root level), or data itself
  const dataAny = data.data as any;
  const evaluationData = dataAny.evaluation || dataAny;
  const flags = evaluationData.flags || dataAny.flags || {
    consensus: [],
    by_category: {},
  };
  
  // Extract quick stats for Model Consensus
  const quickStats = evaluationData.quick_stats || dataAny.quick_stats || {};
  const hasStrongConsensus = quickStats.has_strong_consensus || false;
  const confidenceDescription = quickStats.confidence_description || "Models agree";

  const consensusFlags = flags.consensus || [];
  const flagsByCategory = flags.by_category || {};

  if (consensusFlags.length === 0 && Object.keys(flagsByCategory).length === 0) {
    return null;
  }

  return (
    <SectionWrapper
      id="consensus-flags"
      number={sectionNumber}
      title="Flags"
      subtitle="Signals identified by multiple evaluation models"
    >
      {/* Top Consensus Flags */}
      {consensusFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
              <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-accent" />
            </div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Top Signals
          </h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {consensusFlags.map((item: any, index: number) => {
              const modelsCount = Array.isArray(item.models) ? item.models.length : (item.mentioned_by || 0);
              const totalModels = 3; // Total number of evaluators
              return (
                <motion.div
                  key={item.flag || index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-lg p-5 border border-border report-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-md border ${
                        categoryColors[item.category] || "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {formatFlagName(item.category || "")}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {modelsCount}/{totalModels} models
                    </span>
                  </div>
                  <p className="text-lg font-display font-semibold text-foreground">
                    {formatFlagName(item.flag || "")}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Flags by Category */}
      {Object.keys(flagsByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary flex-shrink-0">
              <FontAwesomeIcon icon={faFlag} className="w-5 h-5 text-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              All Flags by Category
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(flagsByCategory).map(([category, categoryFlags]: [string, any], catIndex: number) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.05 }}
                className="bg-card rounded-lg p-4 border border-border report-shadow"
              >
                <h4
                  className={`text-xs px-2 py-1 rounded-md border inline-block mb-4 ${
                    categoryColors[category] || "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {formatFlagName(category)}
                </h4>
                <ul className="space-y-2">
                  {(Array.isArray(categoryFlags) ? categoryFlags : []).map((item: any, index: number) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-sm font-body text-foreground">
                        {formatFlagName(item.flag || "")}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {item.mentioned_by || 0}x
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Model Consensus Card - at the bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 bg-card rounded-xl p-6 border border-border report-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              hasStrongConsensus ? "bg-green-100 dark:bg-green-950/30" : "bg-amber-100 dark:bg-amber-950/30"
            }`}>
              <FontAwesomeIcon 
                icon={faCheck} 
                className={`w-8 h-8 ${
                  hasStrongConsensus ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                }`} 
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              Model Consensus: {hasStrongConsensus ? "Strong" : "Mixed"}
            </h3>
            <p className="text-muted-foreground font-body">
              {confidenceDescription}. All evaluation models have been analyzed and synthesized
              to provide this comprehensive assessment.
            </p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

