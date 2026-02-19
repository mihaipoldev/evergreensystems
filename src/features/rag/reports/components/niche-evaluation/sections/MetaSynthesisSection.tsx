"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { ReportCollapsibleCard } from "../../shared/ReportCollapsibleCard";
import { TagCloud } from "../../shared/TagCloud";
import type { ReportData } from "../../../types";

interface MetaSynthesisSectionProps {
  data: ReportData;
  sectionNumber: string;
  reportId: string;
}


function renderBadgeList(items: unknown, colorClass: string) {
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {arr.map((item, i) => (
        <span
          key={i}
          className={`px-3 py-1.5 ${colorClass} text-xs font-body rounded-md border`}
        >
          {String(item)}
        </span>
      ))}
    </div>
  );
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
  const payload = Array.isArray(dataAny) ? (dataAny as unknown[])[0] : dataAny;
  const payloadObj = (payload ?? dataAny) as Record<string, unknown>;
  const metaSynthesis = payloadObj?.meta_synthesis as Record<string, unknown> | undefined;
  const evidenceSummary = payloadObj?.evidence_summary as Record<string, unknown> | undefined;
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
  const resourceRequirements = metaSynthesis.resource_requirements as Record<string, unknown> | undefined;

  return (
    <SectionWrapper
      id="meta-synthesis"
      number={sectionNumber}
      title="Meta Synthesis Deep Dive"
      subtitle="Comprehensive analysis across consensus, evidence, dimensions, and execution"
    >
      <div className="space-y-4">
        {consensus && (
          <ReportCollapsibleCard
            id={`meta-synthesis-consensus`}
            title="Consensus Analysis"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-4">
              {consensus.unanimous_agreement ? (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Unanimous Agreement</h4>
                  {renderBadgeList(consensus.unanimous_agreement, "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800")}
                </div>
              ) : null}
              {consensus.majority_consensus ? (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Majority Consensus</h4>
                  {renderBadgeList(consensus.majority_consensus, "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800")}
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
          </ReportCollapsibleCard>
        )}

        {(evidenceQuality || evidenceSummary) && (
          <ReportCollapsibleCard
            id={`meta-synthesis-evidence`}
            title="Evidence Quality Assessment"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-4">
              {Array.isArray(evidenceSummary?.unanimous_facts) && (evidenceSummary!.unanimous_facts as string[]).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Unanimous Facts</h4>
                  {renderBadgeList(evidenceSummary!.unanimous_facts as string[], "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800")}
                </div>
              )}
              {(evidenceQuality?.strongest_evidence ?? evidenceSummary?.strongest_proof) ? (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Strongest Evidence</h4>
                  {renderBadgeList(
                    (evidenceQuality?.strongest_evidence ?? evidenceSummary?.strongest_proof) as string[],
                    "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  )}
                </div>
              ) : null}
              {evidenceQuality?.evidence_gaps ? (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Evidence Gaps</h4>
                  {renderBadgeList(evidenceQuality.evidence_gaps, "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800")}
                </div>
              ) : null}
              {(() => {
                const reliability =
                  evidenceQuality?.reliability_rating ?? evidenceSummary?.reliability_by_dimension;
                return reliability && typeof reliability === "object" ? (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Reliability by Dimension</h4>
                  <div className="space-y-3">
                    {Object.entries(reliability as Record<string, string>).map(([dim, val]) => (
                      <div key={dim} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          {dim.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm font-medium text-foreground">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                ) : null;
              })()}
            </div>
          </ReportCollapsibleCard>
        )}

        {dimensionSynthesis && Object.keys(dimensionSynthesis).length > 0 && (
          <ReportCollapsibleCard
            id={`meta-synthesis-dimensions`}
            title="Dimension Synthesis"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
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
                          {renderBadgeList(d.key_proof_points as string[], "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800")}
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
          </ReportCollapsibleCard>
        )}

        {addressableSegment && (
          <ReportCollapsibleCard
            id={`meta-synthesis-addressable`}
            title="Addressable Segment"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
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
                  <TagCloud tags={addressableSegment.filtering_criteria as string[]} variant="accent" />
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
          </ReportCollapsibleCard>
        )}

        {riskAssessment && (
          <ReportCollapsibleCard
            id={`meta-synthesis-risks`}
            title="Risk Assessment"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-4">
              {riskAssessment.risk_prioritization ? (
                <p className="text-sm font-medium">
                  {String(riskAssessment.risk_prioritization)}
                </p>
              ) : null}
              {Array.isArray(riskAssessment.critical_risks) &&
                (riskAssessment.critical_risks as Record<string, unknown>[]).map((r, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-muted/30">
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
          </ReportCollapsibleCard>
        )}

        {resourceRequirements && (
          <ReportCollapsibleCard
            id={`meta-synthesis-resources`}
            title="Resource Requirements"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-4">
              {resourceRequirements.research_depth ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Research Depth
                  </p>
                  <p className="text-sm font-medium text-foreground">{String(resourceRequirements.research_depth)}</p>
                </div>
              ) : null}
              {resourceRequirements.client_education ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Client Education
                  </p>
                  <p className="text-sm font-medium text-foreground">{String(resourceRequirements.client_education)}</p>
                </div>
              ) : null}
              {resourceRequirements.estimated_ramp_time ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Ramp Time
                  </p>
                  <p className="text-sm font-medium text-foreground">{String(resourceRequirements.estimated_ramp_time)}</p>
                </div>
              ) : null}
              {resourceRequirements.messaging_complexity ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Messaging Complexity
                  </p>
                  <p className="text-sm font-medium text-foreground">{String(resourceRequirements.messaging_complexity)}</p>
                </div>
              ) : null}
            </div>
          </ReportCollapsibleCard>
        )}

        {competitivePositioning && (
          <ReportCollapsibleCard
            id={`meta-synthesis-competitive`}
            title="Competitive Positioning"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-4 text-sm">
              {Array.isArray(competitivePositioning.existing_competitors) && (
                <div>
                  <h4 className="font-semibold mb-2">Existing Competitors</h4>
                  <TagCloud tags={competitivePositioning.existing_competitors as string[]} variant="accent" />
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
          </ReportCollapsibleCard>
        )}

        {executionRoadmap && Object.keys(executionRoadmap).length > 0 && (
          <ReportCollapsibleCard
            id={`meta-synthesis-roadmap`}
            title="Execution Roadmap"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
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
                          {renderBadgeList(p.actions as string[], "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800")}
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
          </ReportCollapsibleCard>
        )}

        {successMetrics && (
          <ReportCollapsibleCard
            id={`meta-synthesis-metrics`}
            title="Success Metrics"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-8">
              {Array.isArray(successMetrics.leading_indicators) &&
                (successMetrics.leading_indicators as string[]).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-foreground">
                      Leading Indicators
                    </h3>
                    <div className="pl-0 md:pl-4 border-l-2 border-border">
                      {renderBadgeList(successMetrics.leading_indicators as string[], "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800")}
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
                      {renderBadgeList(successMetrics.lagging_indicators as string[], "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800")}
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
          </ReportCollapsibleCard>
        )}

        {decisionFramework && (
          <ReportCollapsibleCard
            id={`meta-synthesis-framework`}
            title="Decision Framework"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.isArray(decisionFramework.go_criteria) && (decisionFramework.go_criteria as string[]).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">
                      Go Criteria
                    </h4>
                    {renderBadgeList(decisionFramework.go_criteria as string[], "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800")}
                  </div>
                )}
                {Array.isArray(decisionFramework.no_go_criteria) && (decisionFramework.no_go_criteria as string[]).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400">
                      No-Go Criteria
                    </h4>
                    {renderBadgeList(decisionFramework.no_go_criteria as string[], "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800")}
                  </div>
                )}
              </div>
              {Array.isArray(decisionFramework.reassessment_triggers) && (decisionFramework.reassessment_triggers as string[]).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Reassessment Triggers</h4>
                  {renderBadgeList(decisionFramework.reassessment_triggers as string[], "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800")}
                </div>
              )}
            </div>
          </ReportCollapsibleCard>
        )}

        {keyInsights && keyInsights.length > 0 && (
          <ReportCollapsibleCard
            id={`meta-synthesis-insights`}
            title="Key Insights"
            reportId={reportId}
            defaultOpen
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <div className="space-y-3">
              {keyInsights.map((insight, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-muted/20">
                  <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </ReportCollapsibleCard>
        )}

        {finalRationale && (
          <ReportCollapsibleCard
            id={`meta-synthesis-rationale`}
            title="Final Recommendation Rationale"
            reportId={reportId}
            icon={<FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-primary" />}
          >
            <p className="text-sm text-foreground leading-relaxed">{finalRationale}</p>
          </ReportCollapsibleCard>
        )}
      </div>
    </SectionWrapper>
  );
};
