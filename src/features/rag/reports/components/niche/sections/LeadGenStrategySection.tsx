"use client";

import { SectionWrapper } from "../../shared/SectionWrapper";
import { FitScoreGauge } from "../../shared/FitScoreGauge";
import { VerdictBadge } from "../../shared/VerdictBadge";
import { InsightList } from "../../shared/InsightList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import type { ReportData } from "../../../types";

interface LeadGenStrategySectionProps {
  strategy: ReportData["data"]["lead_gen_strategy"];
}

export const LeadGenStrategySection = ({ strategy }: LeadGenStrategySectionProps) => {
  return (
    <SectionWrapper
      id="lead-gen-strategy"
      number="04"
      title="Lead Generation Strategy"
      subtitle="Fit evaluation, strategic verdict, and the best market entry wedge"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <FitScoreGauge score={strategy.lead_gen_fit_score} />
        <div className="lg:col-span-2">
          <VerdictBadge
            verdict={strategy.verdict as "pursue" | "test" | "avoid"}
            nextStep={strategy.next_step_if_test}
          />
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Fit Score Rationale
        </h4>
        {strategy.fit_rationale_description && (
          <p className="text-sm text-muted-foreground font-body mb-4">
            {typeof strategy.fit_rationale_description === "string"
              ? strategy.fit_rationale_description
              : (strategy.fit_rationale_description as any)?.value ||
                (strategy.fit_rationale_description as any)?.text ||
                (strategy.fit_rationale_description as any)?.description ||
                String(strategy.fit_rationale_description)}
          </p>
        )}
        <InsightList items={strategy.fit_rationale} type="success" numbered />
      </div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-primary rounded-xl overflow-hidden"
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
    </SectionWrapper>
  );
};

