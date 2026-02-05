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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightList } from "../../shared/InsightList";
import type { ReportData } from "../../../types";

interface MetaSynthesisSectionProps {
  data: ReportData;
  sectionNumber: string;
  reportId: string;
}

function MetaSubsection({
  id,
  title,
  children,
  reportId,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  reportId: string;
  defaultOpen?: boolean;
}) {
  const groupId = getReportGroupId(reportId, `meta-synthesis-${id}`);
  const [open, setOpen] = useState(() => getStoredCollapsibleState(groupId, defaultOpen));

  useEffect(() => {
    setStoredCollapsibleState(groupId, open);
  }, [groupId, open]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between p-4 md:p-6 transition-colors text-left"
            aria-expanded={open}
          >
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <FontAwesomeIcon
              icon={open ? faChevronUp : faChevronDown}
              className="w-4 h-4 text-muted-foreground"
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 border-t border-border">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function renderList(items: unknown, type: "success" | "critical" | "info" = "info") {
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return null;
  return <InsightList items={arr.map(String)} type={type} />;
}

function renderObjectList(
  items: Array<Record<string, unknown>>,
  renderItem: (item: Record<string, unknown>) => React.ReactNode
) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg border border-border bg-muted/20">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

export const MetaSynthesisSection = ({
  data,
  sectionNumber,
  reportId,
}: MetaSynthesisSectionProps) => {
  const dataAny = data.data as Record<string, unknown>;
  const metaSynthesis = dataAny?.meta_synthesis as Record<string, unknown> | undefined;
  if (!metaSynthesis) return null;

  const consensus = metaSynthesis.consensus_analysis as Record<string, unknown> | undefined;
  const evidenceQuality = metaSynthesis.evidence_quality_assessment as Record<
    string,
    unknown
  > | undefined;
  const dimensionSynthesis = metaSynthesis.dimension_synthesis as Record<
    string,
    Record<string, unknown>
  > | undefined;
  const addressableSegment = metaSynthesis.addressable_segment as Record<
    string,
    unknown
  > | undefined;
  const riskAssessment = metaSynthesis.risk_assessment as Record<string, unknown> | undefined;
  const competitivePositioning = metaSynthesis.competitive_positioning as Record<
    string,
    unknown
  > | undefined;
  const executionRoadmap = metaSynthesis.execution_roadmap as Record<
    string,
    Record<string, unknown>
  > | undefined;
  const successMetrics = metaSynthesis.success_metrics as Record<string, unknown> | undefined;
  const decisionFramework = metaSynthesis.decision_framework as Record<
    string,
    unknown
  > | undefined;
  const keyInsights = metaSynthesis.key_insights as string[] | undefined;
  const finalRationale = metaSynthesis.final_recommendation_rationale as string | undefined;

  return (
    <SectionWrapper
      id="meta-synthesis"
      number={sectionNumber}
      title="Meta Synthesis Deep Dive"
      subtitle="Comprehensive analysis across consensus, evidence, dimensions, and execution"
    >
      <div className="space-y-4">
        {consensus && (
          <MetaSubsection id="consensus" title="Consensus Analysis" reportId={reportId}>
            <div className="space-y-4">
              {consensus.unanimous_agreement ? (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Unanimous Agreement</h4>
                  {renderList(consensus.unanimous_agreement, "success")}
                </div>
              ) : null}
              {consensus.majority_consensus ? (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Majority Consensus</h4>
                  {renderList(consensus.majority_consensus, "info")}
                </div>
              ) : null}
              {Array.isArray(consensus.key_disagreements) &&
                (consensus.key_disagreements as Record<string, unknown>[]).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Key Disagreements</h4>
                    {renderObjectList(
                      consensus.key_disagreements as Record<string, unknown>[],
                      (item) => (
                        <div className="space-y-2 text-sm">
                          {item.topic ? (
                            <p className="font-medium">{String(item.topic)}</p>
                          ) : null}
                          {item.agent_positions ? (
                            <p className="text-muted-foreground">
                              {String(item.agent_positions)}
                            </p>
                          ) : null}
                          {item.resolution ? (
                            <p className="text-muted-foreground italic">
                              Resolution: {String(item.resolution)}
                            </p>
                          ) : null}
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </MetaSubsection>
        )}

        {evidenceQuality && (
          <MetaSubsection id="evidence" title="Evidence Quality Assessment" reportId={reportId}>
            <div className="space-y-4">
              {evidenceQuality.strongest_evidence ? (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Strongest Evidence</h4>
                  {renderList(evidenceQuality.strongest_evidence, "success")}
                </div>
              ) : null}
              {evidenceQuality.evidence_gaps ? (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Evidence Gaps</h4>
                  {renderList(evidenceQuality.evidence_gaps, "critical")}
                </div>
              ) : null}
              {evidenceQuality.reliability_rating &&
              typeof evidenceQuality.reliability_rating === "object" ? (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Reliability by Dimension</h4>
                  <div className="space-y-3">
                    {Object.entries(
                      evidenceQuality.reliability_rating as Record<string, string>
                    ).map(([dim, val]) => (
                      <div key={dim} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          {dim.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm font-medium text-foreground">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </MetaSubsection>
        )}

        {dimensionSynthesis && Object.keys(dimensionSynthesis).length > 0 && (
          <MetaSubsection id="dimensions" title="Dimension Synthesis" reportId={reportId}>
            <div className="space-y-8">
              {Object.entries(dimensionSynthesis).map(([dimName, dimData]) => {
                const d = dimData as Record<string, unknown>;
                return (
                  <div key={dimName} className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-foreground capitalize">
                      {dimName.replace(/_/g, " ")}
                    </h3>
                    <div className="space-y-4 pl-0 md:pl-4 border-l-2 border-border">
                      {d.consensus_score != null && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Consensus Score
                          </p>
                          <p className="text-sm font-medium text-foreground">{String(d.consensus_score)}</p>
                        </div>
                      )}
                      {d.score_range != null ? (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Range
                          </p>
                          <p className="text-sm font-medium text-foreground">{String(d.score_range)}</p>
                        </div>
                      ) : null}
                      {Array.isArray(d.key_proof_points) && (d.key_proof_points as string[]).length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            Proof Points
                          </p>
                          <InsightList items={d.key_proof_points as string[]} type="success" />
                        </div>
                      )}
                      {d.remaining_concerns != null && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Concerns
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {typeof d.remaining_concerns === "string"
                              ? d.remaining_concerns
                              : Array.isArray(d.remaining_concerns)
                                ? (d.remaining_concerns as string[]).join("; ")
                                : String(d.remaining_concerns ?? "")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </MetaSubsection>
        )}

        {addressableSegment && (
          <MetaSubsection id="addressable" title="Addressable Segment" reportId={reportId}>
            <div className="space-y-3 text-sm">
              {addressableSegment.consensus_definition ? (
                <div>
                  <span className="font-semibold">Definition: </span>
                  <span className="text-muted-foreground">
                    {String(addressableSegment.consensus_definition)}
                  </span>
                </div>
              ) : null}
              {addressableSegment.estimated_size ? (
                <div>
                  <span className="font-semibold">Size: </span>
                  <span className="text-muted-foreground">
                    {String(addressableSegment.estimated_size)}
                  </span>
                </div>
              ) : null}
              {Array.isArray(addressableSegment.filtering_criteria) && (
                <div>
                  <span className="font-semibold block mb-2">Filtering Criteria:</span>
                  <InsightList
                    items={addressableSegment.filtering_criteria as string[]}
                    type="accent"
                  />
                </div>
              )}
              {addressableSegment.market_proof_source ? (
                <div>
                  <span className="font-semibold">Market Proof: </span>
                  <span className="text-muted-foreground">
                    {String(addressableSegment.market_proof_source)}
                  </span>
                </div>
              ) : null}
            </div>
          </MetaSubsection>
        )}

        {riskAssessment && (
          <MetaSubsection id="risks" title="Risk Assessment" reportId={reportId}>
            <div className="space-y-4">
              {riskAssessment.risk_prioritization ? (
                <p className="text-sm font-medium">
                  {String(riskAssessment.risk_prioritization)}
                </p>
              ) : null}
              {Array.isArray(riskAssessment.critical_risks) &&
                (riskAssessment.critical_risks as Record<string, unknown>[]).map((r, i) => (
                  <div key={i} className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <p className="font-medium text-sm">{String(r.risk)}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      {r.likelihood ? (
                        <span>Likelihood: {String(r.likelihood)}</span>
                      ) : null}
                      {r.impact ? <span>Impact: {String(r.impact)}</span> : null}
                    </div>
                    {r.mitigation ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Mitigation: {String(r.mitigation)}
                      </p>
                    ) : null}
                  </div>
                ))}
            </div>
          </MetaSubsection>
        )}

        {competitivePositioning && (
          <MetaSubsection id="competitive" title="Competitive Positioning" reportId={reportId}>
            <div className="space-y-4 text-sm">
              {Array.isArray(competitivePositioning.existing_competitors) && (
                <div>
                  <h4 className="font-semibold mb-2">Existing Competitors</h4>
                  <InsightList
                    items={competitivePositioning.existing_competitors as string[]}
                    type="info"
                  />
                </div>
              )}
              {competitivePositioning.differentiation_strategy ? (
                <div>
                  <span className="font-semibold">Differentiation: </span>
                  <span className="text-muted-foreground">
                    {String(competitivePositioning.differentiation_strategy)}
                  </span>
                </div>
              ) : null}
              {competitivePositioning.competitive_advantage ? (
                <div>
                  <span className="font-semibold">Advantage: </span>
                  <span className="text-muted-foreground">
                    {String(competitivePositioning.competitive_advantage)}
                  </span>
                </div>
              ) : null}
              {competitivePositioning.market_saturation_level ? (
                <div>
                  <span className="font-semibold">Saturation: </span>
                  <span className="text-muted-foreground">
                    {String(competitivePositioning.market_saturation_level)}
                  </span>
                </div>
              ) : null}
            </div>
          </MetaSubsection>
        )}

        {executionRoadmap && Object.keys(executionRoadmap).length > 0 && (
          <MetaSubsection id="roadmap" title="Execution Roadmap" reportId={reportId}>
            <div className="space-y-8">
              {Object.entries(executionRoadmap)
                .sort(([a], [b]) => {
                  const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
                  const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
                  if (numA !== numB) return numA - numB;
                  return a.localeCompare(b);
                })
                .map(([phaseKey, phase]) => {
                const p = phase as Record<string, unknown>;
                return (
                  <div key={phaseKey} className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-foreground capitalize">
                      {phaseKey.replace(/_/g, " ")}
                    </h3>
                    <div className="space-y-4 pl-0 md:pl-4 border-l-2 border-border">
                      {p.objective ? (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Objective
                          </p>
                          <p className="text-sm font-medium text-foreground">{String(p.objective)}</p>
                        </div>
                      ) : null}
                      {Array.isArray(p.actions) && (p.actions as string[]).length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            Actions
                          </p>
                          <InsightList items={p.actions as string[]} type="accent" />
                        </div>
                      )}
                      {p.success_criteria ? (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Success Criteria
                          </p>
                          <p className="text-sm font-medium text-foreground">{String(p.success_criteria)}</p>
                        </div>
                      ) : null}
                      {p.timeline ? (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Timeline
                          </p>
                          <p className="text-sm font-medium text-foreground">{String(p.timeline)}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </MetaSubsection>
        )}

        {successMetrics && (
          <MetaSubsection id="metrics" title="Success Metrics" reportId={reportId}>
            <div className="space-y-8">
              {Array.isArray(successMetrics.leading_indicators) &&
                (successMetrics.leading_indicators as string[]).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-foreground">
                      Leading Indicators
                    </h3>
                    <div className="pl-0 md:pl-4 border-l-2 border-border">
                      <InsightList items={successMetrics.leading_indicators as string[]} type="success" />
                    </div>
                  </div>
                )}
              {Array.isArray(successMetrics.lagging_indicators) &&
                (successMetrics.lagging_indicators as string[]).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-foreground">
                      Lagging Indicators
                    </h3>
                    <div className="pl-0 md:pl-4 border-l-2 border-border">
                      <InsightList items={successMetrics.lagging_indicators as string[]} type="info" />
                    </div>
                  </div>
                )}
              {(() => {
                const benchmarks = successMetrics.benchmark_targets as Record<string, string> | undefined;
                if (!benchmarks || typeof benchmarks !== "object" || Object.keys(benchmarks).length === 0) {
                  return null;
                }
                return (
                  <div className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-foreground">
                      Benchmarks
                    </h3>
                    <div className="space-y-4 pl-0 md:pl-4 border-l-2 border-border">
                      {Object.entries(benchmarks).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            {k.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm font-medium text-foreground">{String(v ?? "")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </MetaSubsection>
        )}

        {decisionFramework && (
          <MetaSubsection id="framework" title="Decision Framework" reportId={reportId}>
            <div className="space-y-4 text-sm">
              {Array.isArray(decisionFramework.go_criteria) && (
                <div>
                  <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                    Go Criteria
                  </h4>
                  <InsightList items={decisionFramework.go_criteria as string[]} type="success" />
                </div>
              )}
              {Array.isArray(decisionFramework.no_go_criteria) && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">
                    No-Go Criteria
                  </h4>
                  <InsightList items={decisionFramework.no_go_criteria as string[]} type="critical" />
                </div>
              )}
              {Array.isArray(decisionFramework.reassessment_triggers) && (
                <div>
                  <h4 className="font-semibold mb-2">Reassessment Triggers</h4>
                  <InsightList
                    items={decisionFramework.reassessment_triggers as string[]}
                    type="warning"
                  />
                </div>
              )}
            </div>
          </MetaSubsection>
        )}

        {keyInsights && keyInsights.length > 0 && (
          <MetaSubsection id="insights" title="Key Insights" reportId={reportId} defaultOpen>
            <InsightList items={keyInsights} type="accent" />
          </MetaSubsection>
        )}

        {finalRationale && (
          <MetaSubsection id="rationale" title="Final Recommendation Rationale" reportId={reportId}>
            <p className="text-sm text-foreground leading-relaxed">{finalRationale}</p>
          </MetaSubsection>
        )}
      </div>
    </SectionWrapper>
  );
};
