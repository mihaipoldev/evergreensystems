"use client";

import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { InsightList } from "../../shared/InsightList";
import { FitScoreGauge } from "../../shared/FitScoreGauge";
import { VerdictBadge } from "../../shared/VerdictBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faXmarkCircle,
  faExclamationTriangle,
  faChartLine,
  faGavel,
  faBan,
  faCalculator,
  faInfoCircle,
  faArrowTrendUp,
  faScaleBalanced,
  faShield,
  faBullseye,
  faLightbulb,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import type { ReportData } from "../../../types";
import {
  getFitScoreCategory,
  getFitScoreColorClasses,
} from "@/features/rag/shared/utils/fitScoreColors";

interface LeadGenScoringSectionProps {
  scoring: NonNullable<ReportData["data"]["lead_gen_scoring"]>;
  sectionNumber?: string;
}

export const LeadGenScoringSection = ({ scoring, sectionNumber = "11" }: LeadGenScoringSectionProps) => {
  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    // Use fit score utility to determine color based on percentage
    const category = getFitScoreCategory(percentage, null);
    return getFitScoreColorClasses(category);
  };

  const getFilterPassColor = (pass: boolean) => {
    return pass 
      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
  };

  return (
    <SectionWrapper
      id="lead-gen-scoring"
      number={sectionNumber}
      title="Lead Gen Scoring"
      subtitle="Rigorous fit scoring with transparent methodology, dealbreaker detection, and final verdict"
    >
      {/* Score + Verdict Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FitScoreGauge score={scoring.lead_gen_fit_score} />
        <VerdictBadge 
          verdict={scoring.verdict} 
          fit_score={scoring.lead_gen_fit_score}
          nextStep={scoring.interpretation?.recommendation}
        />
      </div>

      {/* Verdict Rationale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl border border-border p-6 mb-8"
      >
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faScaleBalanced} className="w-5 h-5" />
          Verdict Rationale
        </h4>
        <p className="text-muted-foreground font-body leading-relaxed whitespace-pre-line">
          {scoring.verdict_rationale}
        </p>
      </motion.div>

      {/* Score Breakdown */}
      {scoring.score_breakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h4 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-primary" />
            Score Breakdown
          </h4>
          
          <div className="space-y-4 mb-6">
            {scoring.score_breakdown.components.map((component, index) => (
              <div key={index} className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-semibold text-foreground">
                      {component.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      Weight: {component.weight}%
                    </span>
                  </div>
                  <span className={`font-display font-bold ${getScoreColor(component.score, component.max_score)}`}>
                    {component.score}/{component.max_score}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="px-2 py-0.5 bg-primary/10 rounded text-primary text-xs font-body">
                    {component.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-body">
                  {component.reasoning}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-body">Total Before Caps:</span>
              <span className="font-display font-semibold text-foreground">{scoring.score_breakdown.total_before_caps}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-body">Dealbreaker Cap:</span>
              <span className="font-display font-semibold text-red-600 dark:text-red-400">{scoring.score_breakdown.dealbreaker_cap_applied}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-body">Final Score:</span>
              <span className="font-display font-bold text-xl text-primary">{scoring.score_breakdown.final_score}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dealbreakers */}
      {scoring.dealbreakers && scoring.dealbreakers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-500" />
            Dealbreakers
          </h4>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Critical constraints that cap the final score.
          </p>
          <div className="space-y-4">
            {scoring.dealbreakers.map((dealbreaker, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 border ${
                  dealbreaker.severity === "catastrophic"
                    ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                    : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h5 className="text-base font-display font-semibold text-foreground">{dealbreaker.type}</h5>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      dealbreaker.severity === "catastrophic"
                        ? "bg-red-600 text-white dark:bg-red-700"
                        : "bg-amber-600 text-white dark:bg-amber-700"
                    }`}>
                      {dealbreaker.severity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-body text-muted-foreground">Score Cap: </span>
                    <span className="text-sm font-body font-semibold text-foreground">
                      {dealbreaker.score_cap_applied}/100
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-xs font-body text-muted-foreground">Threshold: </span>
                  <span className="text-sm font-body font-semibold text-foreground">
                    {dealbreaker.threshold.toLocaleString()}
                  </span>
                  <span className="text-xs font-body text-muted-foreground mx-2">vs Actual: </span>
                  <span className="text-sm font-body font-semibold text-foreground">
                    {dealbreaker.actual_value.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-body text-foreground leading-relaxed">{dealbreaker.impact}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Final Jury Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <FontAwesomeIcon icon={faShield} className="w-5 h-5 text-primary" />
            Final Jury Results
          </h4>
          <div className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
            scoring.final_jury_results.overall_pass 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {scoring.final_jury_results.filters_passed} Passed
          </div>
        </div>

        <div className="space-y-4">
          {/* Budget Filter */}
          <div className={`rounded-lg p-4 border ${getFilterPassColor(scoring.final_jury_results.budget_filter.pass)}`}>
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon 
                icon={scoring.final_jury_results.budget_filter.pass ? faCheckCircle : faXmarkCircle} 
                className={`w-5 h-5 ${
                  scoring.final_jury_results.budget_filter.pass 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`} 
              />
              <span className="font-display font-semibold text-foreground">Budget/ROI Filter</span>
            </div>
            <div className="text-2xl font-display font-bold text-foreground mb-2">
              {scoring.final_jury_results.budget_filter.roi_multiple}x ROI
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {scoring.final_jury_results.budget_filter.reasoning}
            </p>
          </div>

          {/* Scalability Filter */}
          <div className={`rounded-lg p-4 border ${getFilterPassColor(scoring.final_jury_results.scalability_filter.pass)}`}>
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon 
                icon={scoring.final_jury_results.scalability_filter.pass ? faCheckCircle : faXmarkCircle} 
                className={`w-5 h-5 ${
                  scoring.final_jury_results.scalability_filter.pass 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`} 
              />
              <span className="font-display font-semibold text-foreground">Scalability Filter</span>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {scoring.final_jury_results.scalability_filter.reasoning}
            </p>
          </div>

          {/* Offer-Market Fit */}
          <div className={`rounded-lg p-4 border ${getFilterPassColor(scoring.final_jury_results.offer_market_fit.pass)}`}>
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon 
                icon={scoring.final_jury_results.offer_market_fit.pass ? faCheckCircle : faXmarkCircle} 
                className={`w-5 h-5 ${
                  scoring.final_jury_results.offer_market_fit.pass 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`} 
              />
              <span className="font-display font-semibold text-foreground">Offer-Market Fit</span>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {scoring.final_jury_results.offer_market_fit.reasoning}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Scorecard Evaluation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-primary" />
            Scorecard Evaluation
          </h4>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
              scoring.scorecard_evaluation.scorecard_summary.percentage >= 70 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : scoring.scorecard_evaluation.scorecard_summary.percentage >= 50
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {scoring.scorecard_evaluation.scorecard_summary.total_yes}/{scoring.scorecard_evaluation.scorecard_summary.total_questions} ({scoring.scorecard_evaluation.scorecard_summary.percentage}%)
            </span>
            <span className="text-sm text-muted-foreground font-body">
              {scoring.scorecard_evaluation.scorecard_summary.interpretation}
            </span>
          </div>
        </div>

        {/* Offer Compatibility */}
        <div className="mb-6">
          <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
            Offer Compatibility ({scoring.scorecard_evaluation.offer_compatibility.total_score})
          </h5>
          <div className="space-y-3">
            {scoring.scorecard_evaluation.offer_compatibility.questions.map((q, index) => (
              <div key={index} className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon 
                    icon={q.answer === "yes" ? faCheckCircle : faXmarkCircle} 
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      q.answer === "yes" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`} 
                  />
                  <div>
                    <p className="font-body font-medium text-foreground mb-1">{q.question}</p>
                    <p className="text-sm text-muted-foreground font-body">{q.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Size and Access */}
        <div className="mb-6">
          <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
            Market Size & Access ({scoring.scorecard_evaluation.market_size_and_access.total_score})
          </h5>
          <div className="space-y-3">
            {scoring.scorecard_evaluation.market_size_and_access.questions.map((q, index) => (
              <div key={index} className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon 
                    icon={q.answer === "yes" ? faCheckCircle : faXmarkCircle} 
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      q.answer === "yes" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`} 
                  />
                  <div>
                    <p className="font-body font-medium text-foreground mb-1">{q.question}</p>
                    <p className="text-sm text-muted-foreground font-body">{q.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Feasibility */}
        <div>
          <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
            Fulfillment Feasibility ({scoring.scorecard_evaluation.fulfillment_feasibility.total_score})
          </h5>
          <div className="space-y-3">
            {scoring.scorecard_evaluation.fulfillment_feasibility.questions.map((q, index) => (
              <div key={index} className="bg-secondary/30 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon 
                    icon={q.answer === "yes" ? faCheckCircle : faXmarkCircle} 
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      q.answer === "yes" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`} 
                  />
                  <div>
                    <p className="font-body font-medium text-foreground mb-1">{q.question}</p>
                    <p className="text-sm text-muted-foreground font-body">{q.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Reasons / Interpretation */}
      {scoring.interpretation && scoring.interpretation.key_reasons && scoring.interpretation.key_reasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary rounded-xl p-6"
        >
          <h4 className="text-lg font-display font-semibold text-primary-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-accent" />
            Key Reasons for {scoring.interpretation.category} Verdict
          </h4>
          <ul className="space-y-3">
            {scoring.interpretation.key_reasons.map((reason, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-primary-foreground/90 font-body"
              >
                <FontAwesomeIcon icon={faArrowTrendDown} className="w-4 h-4 mt-1 flex-shrink-0 text-accent" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </SectionWrapper>
  );
};

