"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { InsightList } from "../../shared/InsightList";
import type { ReportData } from "../../../types";

interface ConcernsOpportunitiesSectionProps {
  data: ReportData;
  sectionNumber: string;
}

export const ConcernsOpportunitiesSection = ({ data, sectionNumber }: ConcernsOpportunitiesSectionProps) => {
  // Extract concerns and opportunities from evaluation data
  // Check multiple possible locations: data.data.evaluation, data.data (root level), or data itself
  const dataAny = data.data as any;
  const evaluationData = dataAny.evaluation || dataAny;
  const criticalConcerns = evaluationData.critical_concerns || dataAny.critical_concerns || [];
  const keyOpportunities = evaluationData.key_opportunities || dataAny.key_opportunities || [];

  if (criticalConcerns.length === 0 && keyOpportunities.length === 0) {
    return null;
  }

  return (
    <SectionWrapper
      id="concerns-opportunities"
      number={sectionNumber}
      title="Concerns & Opportunities"
      subtitle="Key factors influencing the evaluation"
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Critical Concerns */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Critical Concerns
            </h3>
          </div>
          <InsightList items={criticalConcerns} type="critical" />
        </motion.div>

        {/* Key Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex-shrink-0">
              <FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Key Opportunities
            </h3>
          </div>
          <InsightList items={keyOpportunities} type="success" />
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

