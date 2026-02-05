import { motion } from "framer-motion";
import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { Building2, DollarSign, TrendingUp, Cpu } from "lucide-react";
import { icpData } from "@/data/icpData";

export const ICPSnapshotSection = () => {
  const snapshot = icpData.data.buyer_icp.snapshot;
  const profile = snapshot.primary_profile;

  return (
    <SectionWrapper
      id="icp-snapshot"
      number="01"
      title="ICP Snapshot"
      subtitle="Primary profile characteristics of ideal customers"
    >
      {/* Summary */}
      <div className="bg-secondary/50 rounded-xl p-6 mb-8 border border-border">
        <p className="text-base font-body text-foreground leading-relaxed whitespace-pre-line">
          {snapshot.summary}
        </p>
      </div>

      {/* Primary Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Company Size"
          value={profile.company_size}
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="Revenue Range"
          value={profile.revenue_range}
          icon={<DollarSign className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Budget for Solution"
          value={profile.budget_for_solution}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          label="Growth Stage"
          value={profile.growth_stage.split(' - ')[0]}
          description={profile.growth_stage.split(' - ')[1]}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Technical Maturity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-accent/10 rounded-lg p-5 border border-accent/20 mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-accent" />
          <h4 className="text-sm uppercase tracking-wider text-accent font-body font-medium">
            Technical Maturity
          </h4>
        </div>
        <p className="text-sm font-body text-foreground leading-relaxed">
          {profile.technical_maturity}
        </p>
      </motion.div>

      {/* Firmographic Notes */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Firmographic Alignment
        </h4>
        <div className="bg-card rounded-lg p-5 border border-border report-shadow">
          <p className="text-sm font-body text-muted-foreground mb-4">
            {snapshot.firmographic_alignment_notes.explanation}
          </p>
          <ul className="space-y-3">
            {snapshot.firmographic_alignment_notes.implications.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 text-sm font-body text-foreground"
              >
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-primary rounded-xl p-6">
        <h4 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-2">
          Qualification Recommendation
        </h4>
        <p className="text-base font-body text-primary-foreground leading-relaxed">
          {snapshot.firmographic_alignment_notes.recommendation}
        </p>
      </div>
    </SectionWrapper>
  );
};
