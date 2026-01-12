"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faShieldHalved,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../types";
import { StatCard } from "../shared/StatCard";
import {
  SynthesisSection,
  ConcernsOpportunitiesSection,
  IndividualScoresSection,
} from "./sections";

interface NicheEvaluationProps {
  data: ReportData;
  reportId: string;
}

export const NicheEvaluation = ({ data, reportId }: NicheEvaluationProps) => {
  // Extract evaluation data - new structure is an array, get first element
  const dataAny = data.data as any;
  
  console.log("=== NicheEvaluation Debug ===");
  console.log("1. Full data object:", data);
  console.log("2. data.data:", dataAny);
  console.log("3. Is Array?", Array.isArray(dataAny));
  
  // Handle array structure - get first element if it's an array
  const evaluationData = Array.isArray(dataAny) ? dataAny[0] : (dataAny.evaluation || dataAny);
  console.log("4. evaluationData:", evaluationData);
  
  // Get score_details from evaluation data
  const scoreDetails = evaluationData?.score_details;
  console.log("5. scoreDetails:", scoreDetails);
  
  // Get verdict data from evaluationData.verdict
  const verdict = evaluationData?.verdict;
  console.log("6. verdict:", verdict);
  const verdictLabel = verdict?.label || "";
  const verdictScore = verdict?.score || 0;
  const verdictPriority = verdict?.priority || 0;
  const verdictRecommendation = verdict?.recommendation || "";
  
  // Get confidence fields from evaluationData.confidence object
  const confidenceObj = evaluationData?.confidence;
  console.log("7. confidenceObj:", confidenceObj);
  const avgConfidence = confidenceObj?.average || 0;
  const confidenceLevel = confidenceObj?.level || "";
  const confidenceDescription = confidenceObj?.description || "Agreement level across AI evaluators";
  
  console.log("8. Final values:");
  console.log("   - avgConfidence:", avgConfidence);
  console.log("   - confidenceLevel:", confidenceLevel);
  console.log("   - confidenceDescription:", confidenceDescription);
  
  // Format confidence display - show percentage if we have numeric confidence
  const confidence = avgConfidence > 0 ? `${avgConfidence}%` : "—";
  console.log("   - confidence (formatted):", confidence);
  
  // Get score_spread from score_details
  const stdDev = scoreDetails?.score_spread ?? 0;
  console.log("   - stdDev (score_spread):", stdDev);
  console.log("=== End Debug ===");

  // Verdict configuration
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

  const evalVerdictLabel = verdictLabel.toUpperCase();
  const config = verdictConfig[evalVerdictLabel as keyof typeof verdictConfig] || verdictConfig.TEST;
  const Icon = config.icon;

  return (
    <>
      {/* Verdict Hero Card */}
      {verdict && (
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
                  {verdictLabel}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl md:text-4xl font-display font-bold ${config.textColor}`}>
                    {verdictScore.toFixed(1)}
                  </span>
                  <span className="text-sm md:text-lg text-muted-foreground">/100</span>
                </div>
              </div>
              <p className="text-sm md:text-base text-foreground font-body break-words">{verdictRecommendation}</p>
            </div>
            <div className="hidden md:block text-right flex-shrink-0">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                Priority Level
              </span>
              <span className={`text-2xl font-display font-semibold ${config.textColor}`}>
                #{verdictPriority}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
      >
        <StatCard
          label="Model Confidence"
          value={confidence}
          icon={<FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />}
          description={confidenceDescription}
          variant="highlight"
        />
        <StatCard
          label="Score Deviation"
          value={stdDev.toFixed(1)}
          icon={<FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />}
          description="Variance in model scores"
        />
      </motion.div>

      {/* Sections */}
      <SynthesisSection data={data} sectionNumber="01" />
      <ConcernsOpportunitiesSection data={data} sectionNumber="02" />
      <IndividualScoresSection data={data} sectionNumber="03" />
    </>
  );
};

