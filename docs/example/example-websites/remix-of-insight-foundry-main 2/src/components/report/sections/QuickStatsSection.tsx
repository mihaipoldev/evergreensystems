import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Check } from "lucide-react";
import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { evaluationData } from "@/data/evaluationData";

export const QuickStatsSection = () => {
  const { quick_stats, verdict } = evaluationData;

  return (
    <SectionWrapper
      id="quick-stats"
      number="04"
      title="Quick Stats"
      subtitle="At-a-glance evaluation metrics"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Final Score"
          value={`${verdict.score.toFixed(1)}/100`}
          icon={<BarChart3 className="w-4 h-4" />}
          description={verdict.label}
          variant="highlight"
        />
        <StatCard
          label="Positive Signals"
          value={quick_stats.positive_signals}
          icon={<TrendingUp className="w-4 h-4" />}
          description="Opportunities identified"
        />
        <StatCard
          label="Negative Signals"
          value={quick_stats.negative_signals}
          icon={<TrendingDown className="w-4 h-4" />}
          description="Concerns flagged"
        />
        <StatCard
          label="Net Sentiment"
          value={quick_stats.net_sentiment > 0 ? `+${quick_stats.net_sentiment}` : quick_stats.net_sentiment.toString()}
          icon={<Check className="w-4 h-4" />}
          description={quick_stats.net_sentiment > 0 ? "Favorable outlook" : "Mixed outlook"}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl p-6 border border-border report-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              quick_stats.has_strong_consensus ? "bg-green-100" : "bg-amber-100"
            }`}>
              <Check className={`w-8 h-8 ${
                quick_stats.has_strong_consensus ? "text-green-600" : "text-amber-600"
              }`} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              Model Consensus: {quick_stats.has_strong_consensus ? "Strong" : "Mixed"}
            </h3>
            <p className="text-muted-foreground font-body">
              {quick_stats.confidence_description}. All evaluation models have been analyzed and synthesized
              to provide this comprehensive assessment.
            </p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};
