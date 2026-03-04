import { SectionWrapper } from "../SectionWrapper";
import { FitScoreGauge } from "../FitScoreGauge";
import { VerdictBadge } from "../VerdictBadge";
import { reportData } from "@/data/reportData";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Scale, 
  Target,
  TrendingDown,
  Shield,
  BarChart3,
  Lightbulb
} from "lucide-react";

export const LeadGenScoringSection = () => {
  const scoring = reportData.data.lead_gen_scoring;

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "catastrophic":
        return "bg-red-100 text-red-700 border-red-200";
      case "critical":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "high":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getFilterPassColor = (pass: boolean) => {
    return pass 
      ? "bg-green-50 border-green-200" 
      : "bg-red-50 border-red-200";
  };

  return (
    <SectionWrapper
      id="lead-gen-scoring"
      number="10"
      title="Lead Gen Scoring"
      subtitle={scoring.description}
    >
      {/* Score + Verdict Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FitScoreGauge score={scoring.lead_gen_fit_score} />
        <VerdictBadge 
          verdict={scoring.verdict} 
          nextStep={scoring.interpretation.recommendation}
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
          <Scale className="w-5 h-5 text-primary" />
          Verdict Rationale
        </h4>
        <p className="text-muted-foreground font-body leading-relaxed whitespace-pre-line">
          {scoring.verdict_rationale}
        </p>
      </motion.div>

      {/* Score Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl border border-border p-6 mb-8"
      >
        <h4 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
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
            <span className="font-display font-semibold text-red-600">{scoring.score_breakdown.dealbreaker_cap_applied}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-body">Final Score:</span>
            <span className="font-display font-bold text-xl text-primary">{scoring.score_breakdown.final_score}</span>
          </div>
        </div>
      </motion.div>

      {/* Dealbreakers */}
      {scoring.dealbreakers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-red-50/50 rounded-xl border border-red-200 p-6 mb-8"
        >
          <h4 className="text-lg font-display font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Dealbreakers Detected
          </h4>
          <div className="space-y-4">
            {scoring.dealbreakers.map((dealbreaker, index) => (
              <div 
                key={index} 
                className={`rounded-lg p-4 border ${getSeverityColor(dealbreaker.severity)}`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold">{dealbreaker.type}</span>
                    <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10">
                      {dealbreaker.severity}
                    </span>
                  </div>
                  <span className="text-sm font-body whitespace-nowrap">
                    Cap: {dealbreaker.score_cap_applied}
                  </span>
                </div>
                <div className="text-sm mb-2 opacity-80">
                  Threshold: {dealbreaker.threshold} | Actual: {dealbreaker.actual_value}
                </div>
                <p className="text-sm font-body">{dealbreaker.impact}</p>
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
        className="bg-card rounded-xl border border-border p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Final Jury Results
          </h4>
          <div className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
            scoring.final_jury_results.overall_pass 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {scoring.final_jury_results.filters_passed} Passed
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget Filter */}
          <div className={`rounded-lg p-4 border ${getFilterPassColor(scoring.final_jury_results.budget_filter.pass)}`}>
            <div className="flex items-center gap-2 mb-3">
              {scoring.final_jury_results.budget_filter.pass 
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <XCircle className="w-5 h-5 text-red-600" />
              }
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
              {scoring.final_jury_results.scalability_filter.pass 
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <XCircle className="w-5 h-5 text-red-600" />
              }
              <span className="font-display font-semibold text-foreground">Scalability Filter</span>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {scoring.final_jury_results.scalability_filter.reasoning}
            </p>
          </div>

          {/* Offer-Market Fit */}
          <div className={`rounded-lg p-4 border ${getFilterPassColor(scoring.final_jury_results.offer_market_fit.pass)}`}>
            <div className="flex items-center gap-2 mb-3">
              {scoring.final_jury_results.offer_market_fit.pass 
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <XCircle className="w-5 h-5 text-red-600" />
              }
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
        className="bg-card rounded-xl border border-border p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Scorecard Evaluation
          </h4>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-body font-semibold ${
              scoring.scorecard_evaluation.scorecard_summary.percentage >= 70 
                ? "bg-green-100 text-green-700"
                : scoring.scorecard_evaluation.scorecard_summary.percentage >= 50
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
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
                  {q.answer === "yes" 
                    ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  }
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
                  {q.answer === "yes" 
                    ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  }
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
                  {q.answer === "yes" 
                    ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  }
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-primary rounded-xl p-6"
      >
        <h4 className="text-lg font-display font-semibold text-primary-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          Key Reasons for {scoring.interpretation.category} Verdict
        </h4>
        <ul className="space-y-3">
          {scoring.interpretation.key_reasons.map((reason, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-primary-foreground/90 font-body"
            >
              <TrendingDown className="w-4 h-4 mt-1 flex-shrink-0 text-accent" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </SectionWrapper>
  );
};
