import { SectionWrapper } from "../SectionWrapper";
import { InsightList } from "../InsightList";
import { reportData } from "@/data/reportData";
import { motion } from "framer-motion";
import { Lightbulb, Target, Rocket, Calendar, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";

export const LeadGenStrategySection = () => {
  const strategy = reportData.data.lead_gen_strategy;

  return (
    <SectionWrapper
      id="lead-gen-strategy"
      number="04"
      title="Lead Generation Strategy"
      subtitle="Strategic assessment, market entry wedge, and pilot approach"
    >
      {/* Strategic Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Strategic Assessment
          </h4>
          <p className="text-muted-foreground font-body leading-relaxed mb-6">
            {strategy.strategic_assessment.opportunity_summary}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Key Advantages
              </h5>
              <InsightList items={strategy.strategic_assessment.key_advantages} type="success" />
            </div>
            <div>
              <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Key Challenges
              </h5>
              <InsightList items={strategy.strategic_assessment.key_challenges} type="warning" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Red Flags */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Red Flags to Consider
        </h4>
        <InsightList items={strategy.red_flags} type="warning" />
      </div>

      {/* Best Wedge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-primary rounded-xl overflow-hidden mb-8"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h4 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body">
              Best Entry Wedge
            </h4>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-body font-semibold uppercase">
              {strategy.best_wedge.wedge_type}
            </span>
          </div>

          <blockquote className="text-xl font-display text-primary-foreground mb-6 border-l-4 border-accent pl-4">
            "{strategy.best_wedge.wedge_statement}"
          </blockquote>

          <div>
            <h5 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Why This Works
            </h5>
            <ul className="space-y-2">
              {strategy.best_wedge.why_it_works.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm font-body text-primary-foreground/90"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Pilot Approach */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-secondary/30 rounded-xl border border-border overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-display font-semibold text-foreground">
              Recommended Pilot Approach
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-background rounded-lg p-4 border border-border">
              <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Pilot Size
              </h5>
              <p className="text-foreground font-body">
                {strategy.pilot_approach.recommended_pilot_size}
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 border border-border">
              <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Duration
              </h5>
              <p className="text-foreground font-body">
                {strategy.pilot_approach.pilot_duration}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Success Metrics
            </h5>
            <ul className="space-y-2">
              {strategy.pilot_approach.success_metrics.map((metric, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm font-body text-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {metric}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <h5 className="text-sm uppercase tracking-wider text-primary font-body mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timing Considerations
            </h5>
            <p className="text-foreground/80 font-body text-sm">
              {strategy.pilot_approach.timing_considerations}
            </p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};
