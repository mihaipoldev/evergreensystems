import { motion } from "framer-motion";
import { Flag, Users } from "lucide-react";
import { SectionWrapper } from "../SectionWrapper";
import { evaluationData } from "@/data/evaluationData";

const formatFlagName = (flag: string) => {
  return flag
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const categoryColors: Record<string, string> = {
  market_dynamics: "bg-purple-50 border-purple-200 text-purple-700",
  economics: "bg-green-50 border-green-200 text-green-700",
  sales_process: "bg-blue-50 border-blue-200 text-blue-700",
  market_access: "bg-amber-50 border-amber-200 text-amber-700",
  operations: "bg-red-50 border-red-200 text-red-700",
  fit_quality: "bg-cyan-50 border-cyan-200 text-cyan-700",
};

export const ConsensusFlagsSection = () => {
  const { flags } = evaluationData;

  return (
    <SectionWrapper
      id="consensus-flags"
      number="03"
      title="Consensus Flags"
      subtitle="Signals identified by multiple evaluation models"
    >
      {/* Top Consensus Flags */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Top Consensus Signals
          </h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {flags.consensus.map((item, index) => (
            <motion.div
              key={item.flag}
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
                  {formatFlagName(item.category)}
                </span>
                <span className="text-xs text-muted-foreground font-body">
                  {item.mentioned_by}/3 models
                </span>
              </div>
              <p className="text-lg font-display font-semibold text-foreground">
                {formatFlagName(item.flag)}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Flags by Category */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-secondary">
            <Flag className="w-5 h-5 text-foreground" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            All Flags by Category
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(flags.by_category).map(([category, categoryFlags], catIndex) => (
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
                {categoryFlags.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm font-body text-foreground">
                      {formatFlagName(item.flag)}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.mentioned_by}x
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
};
