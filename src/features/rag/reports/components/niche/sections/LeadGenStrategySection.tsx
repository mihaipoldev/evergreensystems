"use client";

import { SectionWrapper } from "../../shared/SectionWrapper";
import { InsightList } from "../../shared/InsightList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faBullseye,
  faArrowTrendUp,
  faCheckCircle,
  faExclamationTriangle,
  faRocket,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import type { ReportData } from "../../../types";

interface LeadGenStrategySectionProps {
  strategy: ReportData["data"]["lead_gen_strategy"];
  sectionNumber?: string;
}

export const LeadGenStrategySection = ({ strategy, sectionNumber = "05" }: LeadGenStrategySectionProps) => {
  return (
    <SectionWrapper
      id="lead-gen-strategy"
      number={sectionNumber}
      title="Lead Generation Strategy"
      subtitle="Strategic assessment, market entry wedge, and pilot approach"
    >
      {/* Strategic Assessment */}
      {strategy.strategic_assessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5 text-primary" />
            Strategic Assessment
          </h4>
          
          {/* Opportunity Summary Card */}
          <div className="bg-card rounded-xl p-6 border border-border mb-6">
            <p className="text-foreground font-body leading-relaxed">
              {strategy.strategic_assessment.opportunity_summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-500" />
                Key Advantages
              </h5>
              <InsightList items={strategy.strategic_assessment.key_advantages} type="success" />
            </div>
            <div>
              <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 text-amber-500" />
                Key Challenges
              </h5>
              <InsightList items={strategy.strategic_assessment.key_challenges} type="warning" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Best Entry Wedge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-primary rounded-xl overflow-hidden mb-8"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-accent" />
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
              <FontAwesomeIcon icon={faBullseye} className="w-4 h-4" />
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

      {/* Red Flags */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Red Flags to Consider
        </h4>
        {strategy.red_flags_description && (
          <p className="text-sm text-muted-foreground font-body mb-4">
            {typeof strategy.red_flags_description === "string"
              ? strategy.red_flags_description
              : (strategy.red_flags_description as any)?.value ||
                (strategy.red_flags_description as any)?.text ||
                (strategy.red_flags_description as any)?.description ||
                String(strategy.red_flags_description || "")}
          </p>
        )}
        <InsightList items={strategy.red_flags} type="warning" />
      </div>

      {/* Pilot Approach */}
      {strategy.pilot_approach && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className=""
        >
          <div className="">
            <div className="flex items-center gap-2 mb-6">
              <FontAwesomeIcon icon={faRocket} className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-display font-semibold text-foreground">
                Recommended Pilot Approach
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-background rounded-lg p-4 border border-border">
                <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullseye} className="w-4 h-4" />
                  Pilot Size
                </h5>
                <p className="text-foreground font-body">
                  {strategy.pilot_approach.recommended_pilot_size}
                </p>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                  Duration
                </h5>
                <p className="text-foreground font-body">
                  {strategy.pilot_approach.pilot_duration}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="text-lg font-display font-semibold text-foreground">
                    Success Metrics
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground font-body mb-4">
                  Key performance indicators to track during the pilot
                </p>
                <ul className="space-y-2">
                  {strategy.pilot_approach.success_metrics.map((metric, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm font-body text-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 mt-2 flex-shrink-0" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h5 className="text-sm uppercase tracking-wider text-primary font-body mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                Timing Considerations
              </h5>
              <p className="text-foreground/80 font-body text-sm">
                {strategy.pilot_approach.timing_considerations}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </SectionWrapper>
  );
};

