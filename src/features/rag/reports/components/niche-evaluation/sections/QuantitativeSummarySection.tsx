"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { DimensionScoreBar } from "../../shared/DimensionScoreBar";
import { InsightList } from "../../shared/InsightList";
import {
  getFitScoreLabel,
  getFitScoreBadgeClasses,
  getFitScoreCategory,
  getFitScoreColorClasses,
} from "../../../../shared/utils/fitScoreColors";
import type { FitScoreCategory } from "../../../../shared/utils/fitScoreColors";
import type { ReportData } from "../../../types";
import { normalizeAgentEvaluation } from "../normalizeAgentEvaluation";

interface QuantitativeSummarySectionProps {
  data: ReportData;
  sectionNumber: string;
  reportId: string;
}

function getCategoryFromRecommendation(rec: string): FitScoreCategory {
  const r = String(rec || "").toLowerCase();
  if (r === "pursue") return "pursue";
  if (r === "test") return "test";
  if (r === "caution") return "caution";
  if (r === "avoid") return "avoid";
  if (r === "ideal") return "ideal";
  return "test";
}

function RecommendationBadge({
  recommendation,
}: {
  recommendation: string;
}) {
  if (!recommendation?.trim()) return null;
  const category = getCategoryFromRecommendation(recommendation);
  const label = getFitScoreLabel(category);
  const classes = getFitScoreBadgeClasses(category);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function extractScore(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "score" in val) {
    return Number((val as { score?: number }).score ?? 0);
  }
  return 0;
}

function safeStr(x: unknown): string {
  return String(x ?? "");
}

const DEFAULT_AGENT_LABELS: Record<string, string> = {
  agent_1: "Agent 1 - Market & Operational Reality",
  agent_2: "Agent 2 - Psychology & Positioning",
  agent_3: "Agent 3 - Strategic Assessment",
};

function getAgentLabel(agentKey: string, agentsIncluded?: string[]): string {
  const idx = ["agent_1", "agent_2", "agent_3"].indexOf(agentKey);
  if (agentsIncluded && agentsIncluded[idx]) return agentsIncluded[idx];
  return DEFAULT_AGENT_LABELS[agentKey] ?? agentKey.replace(/_/g, " ");
}

function getActiveTabClasses(rec: string): string {
  if (!rec?.trim()) return "ring-2 ring-accent/30 border-accent/40 bg-accent/[0.06] shadow-md";
  const cat = getCategoryFromRecommendation(rec);
  switch (cat) {
    case "ideal":
      return "ring-2 ring-emerald-500/30 border-emerald-500/40 bg-emerald-500/[0.06] shadow-md";
    case "pursue":
      return "ring-2 ring-green-500/30 border-green-500/40 bg-green-500/[0.06] shadow-md";
    case "test":
      return "ring-2 ring-yellow-500/30 border-yellow-500/40 bg-yellow-500/[0.06] shadow-md";
    case "caution":
      return "ring-2 ring-orange-500/30 border-orange-500/40 bg-orange-500/[0.06] shadow-md";
    case "avoid":
      return "ring-2 ring-red-500/30 border-red-500/40 bg-red-500/[0.06] shadow-md";
    default:
      return "ring-2 ring-accent/30 border-accent/40 bg-accent/[0.06] shadow-md";
  }
}

function AgentContentPanel({ agentData }: { agentData: Record<string, unknown> }) {
  const dimensionScores =
    (agentData.dimension_scores_breakdown ?? agentData.dimension_scores) as
      | Record<string, number | { score?: number; evidence?: string; concerns?: unknown }>
      | undefined;
  const dealBreakers = (agentData.deal_breakers ?? agentData.critical_dealbreakers) as
    | string[]
    | undefined;
  const strongAdvantages = agentData.strong_advantages as string[] | undefined;
  const openQuestions = agentData.open_questions as string[] | undefined;
  const marketIntel = agentData.market_intelligence_summary as Record<string, unknown> | undefined;
  const marketProof = agentData.market_proof_summary as Record<string, unknown> | undefined;
  const risksChallenges = agentData.risks_and_challenges as Record<string, unknown> | undefined;
  const goToMarket = agentData.go_to_market_considerations as Record<string, unknown> | undefined;
  const addressableSegment = agentData.addressable_segment as Record<string, unknown> | undefined;
  const segmentAnalysis = agentData.segment_analysis as Record<string, unknown> | undefined;
  const segment = addressableSegment ?? segmentAnalysis;
  const filteringCriteria = segment?.filtering_criteria ?? segment?.filter_criteria;

  const hasContent =
    (dimensionScores && Object.keys(dimensionScores).length > 0) ||
    (dealBreakers && dealBreakers.length > 0) ||
    (strongAdvantages && strongAdvantages.length > 0) ||
    (openQuestions && openQuestions.length > 0) ||
    marketIntel ||
    marketProof ||
    risksChallenges ||
    goToMarket ||
    segment;

  if (!hasContent) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No detailed evaluation data available for this agent.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dimension Scores */}
      {dimensionScores && Object.keys(dimensionScores).length > 0 && (
        <div className="space-y-5">
          {Object.entries(dimensionScores).map(([dimName, dimVal]) => {
            const d = dimVal as { score?: number; evidence?: string; concerns?: unknown };
            const s = typeof dimVal === "number" ? dimVal : Number(d?.score ?? 0);
            return (
              <div key={dimName} className="space-y-2">
                <DimensionScoreBar label={dimName} score={s} />
                {(d?.evidence || d?.concerns) ? (
                  <div className="pl-1 space-y-1">
                    {d?.evidence && (
                      <p className="text-xs leading-relaxed text-muted-foreground/90">
                        {d.evidence}
                      </p>
                    )}
                    {d?.concerns ? (
                      <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                        <span className="font-medium">Concerns:</span>{" "}
                        {Array.isArray(d.concerns)
                          ? (d.concerns as string[]).join("; ")
                          : safeStr(d.concerns)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Critical Sections */}
      {dealBreakers && dealBreakers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-red-600 dark:text-red-400">
            Deal Breakers
          </h4>
          <InsightList items={dealBreakers} type="critical" />
        </div>
      )}

      {strongAdvantages && strongAdvantages.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-green-600 dark:text-green-400">
            Strong Advantages
          </h4>
          <InsightList items={strongAdvantages} type="success" />
        </div>
      )}

      {openQuestions && openQuestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Open Questions</h4>
          <InsightList items={openQuestions} type="info" />
        </div>
      )}

      {/* Market Intelligence */}
      {marketIntel && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Market Intelligence</h4>
          <div className="space-y-4 pl-1">
            {Array.isArray(marketIntel.key_insights) && marketIntel.key_insights.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Key Insights
                </p>
                <InsightList items={marketIntel.key_insights as string[]} type="accent" />
              </div>
            )}
            {Array.isArray(marketIntel.risks) && marketIntel.risks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Risks
                </p>
                <InsightList items={marketIntel.risks as string[]} type="critical" />
              </div>
            )}
            {Array.isArray(marketIntel.tactical_recommendations) && marketIntel.tactical_recommendations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Tactical Recommendations
                </p>
                <InsightList
                  items={marketIntel.tactical_recommendations as string[]}
                  type="success"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Proof */}
      {marketProof && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Market Proof</h4>
          <div className="space-y-3 pl-1">
            {Array.isArray(marketProof.concrete_examples) && marketProof.concrete_examples.length > 0 && (
              <InsightList items={marketProof.concrete_examples as string[]} type="success" />
            )}
            {marketProof.patterns ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {safeStr(marketProof.patterns)}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Risks & Challenges */}
      {risksChallenges && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Risks & Challenges</h4>
          <div className="space-y-4 pl-1">
            {Array.isArray(risksChallenges.market_risks) && risksChallenges.market_risks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Market Risks
                </p>
                <InsightList items={risksChallenges.market_risks as string[]} type="critical" />
              </div>
            )}
            {Array.isArray(risksChallenges.execution_risks) && risksChallenges.execution_risks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Execution Risks
                </p>
                <InsightList
                  items={risksChallenges.execution_risks as string[]}
                  type="warning"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Go-to-Market */}
      {goToMarket && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Go-to-Market Strategy</h4>
          <div className="space-y-4 pl-1">
            {Array.isArray(goToMarket.messaging_angles) && goToMarket.messaging_angles.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Messaging Angles
                </p>
                <InsightList items={goToMarket.messaging_angles as string[]} type="accent" />
              </div>
            )}
            {Array.isArray(goToMarket.channel_strategy) && goToMarket.channel_strategy.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Channel Strategy
                </p>
                <InsightList items={goToMarket.channel_strategy as string[]} type="info" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Addressable Segment */}
      {segment && (
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Addressable Segment</h4>
          <div className="space-y-3 text-sm">
            {(segment.description ??
              segment.addressable_segment_description ??
              segment.definition) ? (
              <p className="leading-relaxed text-foreground/90">
                {safeStr(
                  segment.description ??
                    segment.addressable_segment_description ??
                    segment.definition
                )}
              </p>
            ) : null}
            {(segment.size_estimate ?? segment.estimated_size ?? segment.segment_size) ? (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Estimated Size:</span>{" "}
                {safeStr(
                  segment.size_estimate ?? segment.estimated_size ?? segment.segment_size
                )}
              </p>
            ) : null}
            {Array.isArray(filteringCriteria) && filteringCriteria.length > 0 && (
              <div>
                <p className="font-medium text-foreground mb-2">Filtering Criteria:</p>
                <InsightList items={filteringCriteria as string[]} type="accent" />
              </div>
            )}
            {(segment.icp_match_evidence ?? segment.icp_match_rationale) ? (
              <p className="leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">ICP Match:</span>{" "}
                {safeStr(segment.icp_match_evidence ?? segment.icp_match_rationale)}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export const QuantitativeSummarySection = ({
  data,
  sectionNumber,
  reportId: _reportId,
}: QuantitativeSummarySectionProps) => {
  void _reportId;
  const [activeTab, setActiveTab] = useState<"final" | number>(0);

  const dataAny = data.data as Record<string, unknown>;
  const payload = Array.isArray(dataAny) ? (dataAny as unknown[])[0] : dataAny;
  const payloadObj = payload as Record<string, unknown> | null;

  const quantSummary = payloadObj?.quantitative_summary as Record<string, unknown> | undefined;
  if (!quantSummary) return null;

  const scoreAnalysis = quantSummary.score_analysis as Record<string, unknown> | undefined;
  const confidenceAnalysis = quantSummary.confidence_analysis as Record<
    string,
    unknown
  > | undefined;
  const dimensionBreakdown = quantSummary.dimension_breakdown as Record<
    string,
    Record<string, unknown>
  > | undefined;

  const decisionCard = payloadObj?.decision_card as Record<string, unknown> | undefined;
  const finalRec =
    String(decisionCard?.recommendation ?? decisionCard?.verdict ?? "").trim() || "";

  const individualEvals = payloadObj?.individual_evaluations as Record<
    string,
    Record<string, unknown>
  > | undefined;

  const agentsIncluded = (data.meta as Record<string, unknown>)?.analysis_summary as
    | { agents_included?: string[] }
    | undefined;
  const agentLabels = agentsIncluded?.agents_included;

  const getAgentRec = (agent: Record<string, unknown> | undefined) => {
    if (!agent) return "";
    const fv = agent.final_verdict as Record<string, unknown> | undefined;
    return String(agent.recommendation ?? fv?.recommendation ?? "").trim();
  };

  const agentKeys = ["agent_1", "agent_2", "agent_3"] as const;
  const agents = agentKeys
    .map((key, i) => {
      const rawData = individualEvals?.[key] as Record<string, unknown> | undefined;
      const normalizedData = rawData ? normalizeAgentEvaluation(rawData) : null;
      const scores = scoreAnalysis?.individual_scores as number[] | undefined;
      const confScores = confidenceAnalysis?.individual_scores as number[] | undefined;
      return {
        key,
        index: i,
        label: getAgentLabel(key, agentLabels),
        score: scores?.[i] ?? Number(normalizedData?.overall_fit_score ?? 0),
        confidence: confScores?.[i] ?? null,
        recommendation:
          getAgentRec(rawData) || String(normalizedData?.recommendation ?? ""),
        evalData: normalizedData,
      };
    })
    .filter((a) => a.score > 0 || a.evalData);

  const safeActiveAgent =
    typeof activeTab === "number"
      ? Math.min(activeTab, Math.max(0, agents.length - 1))
      : null;

  const finalScoreValue = scoreAnalysis?.median;
  const finalConfidence =
    confidenceAnalysis?.consensus != null || confidenceAnalysis?.median != null
      ? String(confidenceAnalysis.consensus ?? confidenceAnalysis.median)
      : null;
  const finalScoreNum = Number(finalScoreValue ?? 0);
  const finalCategory = getFitScoreCategory(finalScoreNum, null);
  const isFinalActive = activeTab === "final";
  const hasDimensionBreakdown =
    dimensionBreakdown && Object.keys(dimensionBreakdown).length > 0;

  return (
    <SectionWrapper
      id="quantitative-summary"
      number={sectionNumber}
      title="Quantitative Summary"
      subtitle="Score distribution, agent evaluations, and dimension breakdown"
    >
      <div className="space-y-6">
        {/* Score Cards Row: Final Score Tab + Agent Tabs */}
        {scoreAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Final Score Tab */}
              {finalScoreValue != null && (
                <button
                  onClick={() => setActiveTab("final")}
                  className={`text-left rounded-lg p-5 border report-shadow transition-all duration-200 cursor-pointer ${
                    isFinalActive
                      ? getActiveTabClasses(finalRec)
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider font-body text-muted-foreground">
                      Final Score
                    </span>
                    <FontAwesomeIcon
                      icon={faChartBar}
                      className={`w-5 h-5 ${getFitScoreColorClasses(finalCategory)}`}
                    />
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <p
                      className={`text-2xl font-display font-semibold ${getFitScoreColorClasses(
                        finalCategory
                      )}`}
                    >
                      {String(finalScoreValue)}
                    </p>
                    {finalRec && (
                      <RecommendationBadge
                        recommendation={finalRec}
                      />
                    )}
                  </div>
                  {finalConfidence && (
                    <p className="text-sm font-body text-muted-foreground">
                      {finalConfidence}% confidence
                    </p>
                  )}
                </button>
              )}

              {/* Agent Tabs */}
              {agents.map((agent) => {
                const isActive = safeActiveAgent === agent.index;
                const scoreCategory = getFitScoreCategory(agent.score, null);
                return (
                  <button
                    key={agent.key}
                    onClick={() => setActiveTab(agent.index)}
                    className={`text-left rounded-lg p-5 border report-shadow transition-all duration-200 cursor-pointer ${
                      isActive
                        ? getActiveTabClasses(agent.recommendation)
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider font-body text-muted-foreground">
                        Agent {agent.index + 1}
                      </span>
                      <FontAwesomeIcon
                        icon={faChartBar}
                        className={`w-5 h-5 ${getFitScoreColorClasses(scoreCategory)}`}
                      />
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <p
                        className={`text-2xl font-display font-semibold ${getFitScoreColorClasses(
                          scoreCategory
                        )}`}
                      >
                        {agent.score}
                      </p>
                      {agent.recommendation && (
                        <RecommendationBadge
                          recommendation={agent.recommendation}
                        />
                      )}
                    </div>
                    {agent.confidence != null && (
                      <p className="text-sm font-body text-muted-foreground">
                        {agent.confidence}% confidence
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Content Panel */}
        <AnimatePresence mode="wait">
          {/* Final Score → Dimension Breakdown */}
          {isFinalActive && hasDimensionBreakdown && (
            <motion.div
              key="final-breakdown"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-border bg-card p-5 md:p-6 report-shadow"
            >
              <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-border">
                <h3 className="text-base font-semibold">Final Score</h3>
                <span className={`text-lg font-display font-bold tabular-nums ${getFitScoreColorClasses(finalCategory)}`}>
                  {String(finalScoreValue)}
                </span>
                {finalRec && (
                  <RecommendationBadge recommendation={finalRec} />
                )}
              </div>
              <div className="space-y-6">
                {Object.entries(dimensionBreakdown!).map(([dimName, dimData]) => {
                  const d = dimData as Record<string, unknown>;
                  const scores = d.scores as unknown[] | undefined;
                  const median = d.median as { score?: number } | number | undefined;
                  const scoresArr = Array.isArray(scores) ? (scores as unknown[]) : [];
                  const scoreVal =
                    typeof median === "object" &&
                    median &&
                    "score" in median &&
                    (median as { score?: number }).score != null
                      ? (median as { score: number }).score
                      : typeof median === "number"
                        ? median
                        : scoresArr.length > 0
                          ? scoresArr.reduce(
                              (sum: number, s: unknown) => sum + extractScore(s),
                              0
                            ) / scoresArr.length
                          : 0;
                  return (
                    <DimensionScoreBar key={dimName} label={dimName} score={scoreVal} />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Agent Evaluation Content */}
          {safeActiveAgent != null &&
            agents.length > 0 &&
            agents[safeActiveAgent]?.evalData && (
              <motion.div
                key={agents[safeActiveAgent].key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-border bg-card p-5 md:p-6 report-shadow"
              >
                <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-border">
                  <h3 className="text-base font-semibold">
                    {agents[safeActiveAgent].label}
                  </h3>
                  <span className={`text-lg font-display font-bold tabular-nums ${getFitScoreColorClasses(getFitScoreCategory(agents[safeActiveAgent].score, null))}`}>
                    {agents[safeActiveAgent].score}
                  </span>
                  {agents[safeActiveAgent].recommendation && (
                    <RecommendationBadge
                      recommendation={agents[safeActiveAgent].recommendation}
                    />
                  )}
                </div>
                <AgentContentPanel
                  agentData={
                    agents[safeActiveAgent].evalData as Record<string, unknown>
                  }
                />
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
};
