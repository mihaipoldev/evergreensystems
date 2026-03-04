import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { SectionWrapper } from "../SectionWrapper";
import { InsightList } from "../InsightList";
import { evaluationData } from "@/data/evaluationData";

export const ConcernsOpportunitiesSection = () => {
  return (
    <SectionWrapper
      id="concerns-opportunities"
      number="02"
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
            <div className="p-2 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Critical Concerns
            </h3>
          </div>
          <InsightList items={evaluationData.critical_concerns} type="warning" />
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
            <div className="p-2 rounded-lg bg-green-50 border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Key Opportunities
            </h3>
          </div>
          <InsightList items={evaluationData.key_opportunities} type="success" />
        </motion.div>
      </div>
    </SectionWrapper>
  );
};
