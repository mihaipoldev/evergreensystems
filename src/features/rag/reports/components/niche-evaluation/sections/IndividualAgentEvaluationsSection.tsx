"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import {
  getStoredCollapsibleState,
  setStoredCollapsibleState,
  getReportGroupId,
} from "@/lib/collapsible-persistence";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { InsightList } from "../../shared/InsightList";
import { DimensionScoreBar } from "../../shared/DimensionScoreBar";
import {
  getFitScoreLabel,
  getFitScoreColorClasses,
} from "../../../../shared/utils/fitScoreColors";
import type { FitScoreCategory } from "../../../../shared/utils/fitScoreColors";
import type { ReportData } from "../../../types";
import { normalizeAgentEvaluation } from "../../../utils/normalizeAgentEvaluation";

function getCategoryFromRecommendation(rec: string): FitScoreCategory {
  const r = String(rec || "").toLowerCase();
  if (r === "pursue") return "pursue";
  if (r === "test") return "test";
  if (r === "caution") return "caution";
  if (r === "avoid") return "avoid";
  if (r === "ideal") return "ideal";
  return "test";
}

interface IndividualAgentEvaluationsSectionProps {
  data: ReportData;
  sectionNumber: string;
  reportId: string;
}

function safeStr(x: unknown): string {
  return String(x ?? "");
}

const AGENT_LABELS: Record<string, string> = {
  agent_1: "Agent 1 - Market & Operational Reality",
  agent_2: "Agent 2 - Psychology & Positioning",
  agent_3: "Agent 3 - Strategic Assessment",
};

function AgentCard({
  agentKey,
  agentData,
  reportId,
}: {
  agentKey: string;
  agentData: Record<string, unknown>;
  reportId: string;
}) {
  const groupId = getReportGroupId(reportId, `agent-eval-${agentKey}`);
  const [open, setOpen] = useState(() => getStoredCollapsibleState(groupId, false));

  useEffect(() => {
    setStoredCollapsibleState(groupId, open);
  }, [groupId, open]);

  const score = Number(agentData.overall_fit_score ?? 0);
  const recommendation = String(agentData.recommendation ?? "");
  const addressableSegment = agentData.addressable_segment as Record<string, unknown> | undefined;
  const segmentAnalysis = agentData.segment_analysis as Record<string, unknown> | undefined;
  const dimensionScores =
    (agentData.dimension_scores_breakdown ?? agentData.dimension_scores) as
      | Record<string, number | { score?: number; evidence?: string; concerns?: unknown }>
      | undefined;
  const dealBreakers = (agentData.deal_breakers ?? agentData.critical_dealbreakers) as
    | string[]
    | undefined;
  const strongAdvantages = agentData.strong_advantages as string[] | undefined;
  const openQuestions = agentData.open_questions as string[] | undefined;
  const marketIntel = agentData.market_intelligence_summary as Record<
    string,
    unknown
  > | undefined;
  const marketProof = agentData.market_proof_summary as Record<string, unknown> | undefined;
  const risksChallenges = agentData.risks_and_challenges as Record<string, unknown> | undefined;
  const goToMarket = agentData.go_to_market_considerations as Record<
    string,
    unknown
  > | undefined;

  const segment = addressableSegment ?? segmentAnalysis;
  const filteringCriteria =
    segment?.filtering_criteria ?? segment?.filter_criteria;
  const label = AGENT_LABELS[agentKey] ?? agentKey.replace(/_/g, " ");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-muted/5 transition-colors text-left"
            aria-expanded={open}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold">{label}</span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl font-display font-bold tabular-nums ${
                    recommendation
                      ? getFitScoreColorClasses(getCategoryFromRecommendation(recommendation))
                      : "text-foreground"
                  }`}
                >
                  {score}
                  {recommendation && (
                    <span className="ml-1.5 font-semibold">
                      {getFitScoreLabel(getCategoryFromRecommendation(recommendation))}
                    </span>
                  )}
                </span>
                {!recommendation && (
                  <span className="text-sm text-muted-foreground">/100</span>
                )}
              </div>
            </div>
            <FontAwesomeIcon
              icon={open ? faChevronUp : faChevronDown}
              className="w-4 h-4 text-muted-foreground flex-shrink-0"
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-6 border-t border-border">
            {dimensionScores && Object.keys(dimensionScores).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Dimension Scores</h4>
                <div className="space-y-6">
                  {Object.entries(dimensionScores).map(([dimName, dimVal]) => {
                    const d = dimVal as { score?: number; evidence?: string; concerns?: unknown };
                    const s = typeof dimVal === "number" ? dimVal : Number(d?.score ?? 0);
                    return (
                      <div key={dimName} className="space-y-1.5">
                        <DimensionScoreBar label={dimName} score={s} />
                        {d?.evidence ? (
                          <p className="text-xs text-muted-foreground">{d.evidence}</p>
                        ) : null}
                        {d?.concerns ? (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Concerns:{" "}
                            {Array.isArray(d.concerns)
                              ? (d.concerns as string[]).join("; ")
                              : safeStr(d.concerns)}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {dealBreakers && dealBreakers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-600 dark:text-red-400">
                  Deal Breakers
                </h4>
                <InsightList items={dealBreakers} type="critical" />
              </div>
            )}

            {strongAdvantages && strongAdvantages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
                  Strong Advantages
                </h4>
                <InsightList items={strongAdvantages} type="success" />
              </div>
            )}

            {openQuestions && openQuestions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Open Questions</h4>
                <InsightList items={openQuestions} type="info" />
              </div>
            )}

            {marketIntel && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Market Intelligence</h4>
                <div className="space-y-2 text-sm">
                  {Array.isArray(marketIntel.key_insights) && (
                    <div>
                      <span className="font-medium">Insights:</span>
                      <InsightList items={marketIntel.key_insights as string[]} type="accent" />
                    </div>
                  )}
                  {Array.isArray(marketIntel.risks) && (
                    <div>
                      <span className="font-medium">Risks:</span>
                      <InsightList items={marketIntel.risks as string[]} type="critical" />
                    </div>
                  )}
                  {Array.isArray(marketIntel.tactical_recommendations) && (
                    <div>
                      <span className="font-medium">Tactical:</span>
                      <InsightList
                        items={marketIntel.tactical_recommendations as string[]}
                        type="success"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {marketProof && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Market Proof</h4>
                <div className="space-y-2 text-sm">
                  {Array.isArray(marketProof.concrete_examples) && (
                    <InsightList items={marketProof.concrete_examples as string[]} type="success" />
                  )}
                  {marketProof.patterns ? (
                    <p className="text-muted-foreground">{safeStr(marketProof.patterns)}</p>
                  ) : null}
                </div>
              </div>
            )}

            {risksChallenges && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Risks & Challenges</h4>
                <div className="space-y-2 text-sm">
                  {Array.isArray(risksChallenges.market_risks) && (
                    <div>
                      <span className="font-medium">Market: </span>
                      <InsightList items={risksChallenges.market_risks as string[]} type="critical" />
                    </div>
                  )}
                  {Array.isArray(risksChallenges.execution_risks) && (
                    <div>
                      <span className="font-medium">Execution: </span>
                      <InsightList
                        items={risksChallenges.execution_risks as string[]}
                        type="warning"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {goToMarket && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Go-to-Market</h4>
                <div className="space-y-2 text-sm">
                  {Array.isArray(goToMarket.messaging_angles) && (
                    <div>
                      <span className="font-medium">Messaging: </span>
                      <InsightList items={goToMarket.messaging_angles as string[]} type="accent" />
                    </div>
                  )}
                  {Array.isArray(goToMarket.channel_strategy) && (
                    <div>
                      <span className="font-medium">Channels: </span>
                      <InsightList items={goToMarket.channel_strategy as string[]} type="info" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {segment && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Addressable Segment</h4>
                <div className="space-y-2 text-sm">
                  {(segment.description ?? segment.addressable_segment_description ?? segment.definition) ? (
                    <p className="text-muted-foreground">
                      {safeStr(
                        segment.description ??
                          segment.addressable_segment_description ??
                          segment.definition
                      )}
                    </p>
                  ) : null}
                  {(segment.size_estimate ?? segment.estimated_size ?? segment.segment_size) ? (
                    <p>
                      <span className="font-medium">Size: </span>
                      {safeStr(
                        segment.size_estimate ??
                          segment.estimated_size ??
                          segment.segment_size
                      )}
                    </p>
                  ) : null}
                  {Array.isArray(filteringCriteria) && (
                    <div className="space-y-4">
                      <span className="font-medium block">Filtering:</span>
                      <InsightList items={filteringCriteria as string[]} type="accent" />
                    </div>
                  )}
                  {(segment.icp_match_evidence ?? segment.icp_match_rationale) ? (
                    <p className="text-muted-foreground">
                      {safeStr(segment.icp_match_evidence ?? segment.icp_match_rationale)}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export const IndividualAgentEvaluationsSection = ({
  data,
  sectionNumber,
  reportId,
}: IndividualAgentEvaluationsSectionProps) => {
  const dataAny = data.data as Record<string, unknown>;
  const individualEvals = dataAny?.individual_evaluations as Record<
    string,
    Record<string, unknown>
  > | undefined;

  if (!individualEvals || Object.keys(individualEvals).length === 0) return null;

  const agents = Object.entries(individualEvals)
    .filter(([, v]) => v && typeof v === "object")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, raw]) => ({
      key,
      data: normalizeAgentEvaluation(raw as Record<string, unknown>) ?? raw,
    }))
    .filter((a) => a.data);

  return (
    <SectionWrapper
      id="individual-evaluations"
      number={sectionNumber}
      title="Individual Agent Evaluations"
      subtitle="Full evaluation details from each agent (expand to view)"
    >
      <div className="space-y-4">
        {agents.map(({ key, data }) => (
          <AgentCard
            key={key}
            agentKey={key}
            agentData={data as Record<string, unknown>}
            reportId={reportId}
          />
        ))}
      </div>
    </SectionWrapper>
  );
};
