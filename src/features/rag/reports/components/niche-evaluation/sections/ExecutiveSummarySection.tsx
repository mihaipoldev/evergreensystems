"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faBullseye,
  faExclamationTriangle,
  faChevronRight,
  faListCheck,
  faGlobe,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import {
  SectionWrapper,
  StatCard,
  BlockHeader,
  TagCloud,
  InsightList,
} from "../../shared";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ReportData } from "../../../types";

interface ExecutiveSummarySectionProps {
  data: ReportData;
  sectionNumber: string;
}

function safeStr(x: unknown): string {
  return String(x ?? "");
}

function getRiskPriorityColor(priority: number): string {
  if (priority >= 7) return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
  if (priority >= 4) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
  return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700";
}

export const ExecutiveSummarySection = ({
  data,
  sectionNumber,
}: ExecutiveSummarySectionProps) => {
  const dataAny = data.data as Record<string, unknown>;
  const decisionCard = dataAny?.decision_card as Record<string, unknown> | undefined;
  if (!decisionCard) return null;

  const scoreContext = decisionCard.score_context as Record<string, unknown> | undefined;
  const top3Reasons = (decisionCard.top_3_reasons as string[]) ?? [];
  const top3Risks = (decisionCard.top_3_risks as Array<{
    risk?: string;
    likelihood?: string;
    impact?: string;
    priority_score?: number;
    mitigation?: string;
  }>) ?? [];
  const marketSnapshot = decisionCard.market_snapshot as Record<string, unknown> | undefined;
  const nextSteps = decisionCard.next_steps as Record<string, unknown> | undefined;
  const differentiation = decisionCard.differentiation as Record<string, string> | undefined;
  const metricsToTrack = decisionCard.metrics_to_track as Record<string, unknown> | undefined;
  const decisionCriteria = decisionCard.decision_criteria as Record<string, unknown> | undefined;

  return (
    <SectionWrapper
      id="executive-summary"
      number={sectionNumber}
      title="Executive Summary"
      subtitle="Overall recommendation with score context and actionable next steps"
    >
      <div className="space-y-8">
        {/* Score Context */}
        {scoreContext && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {!!scoreContext.range && (
              <StatCard
                label="Range"
                value={safeStr(scoreContext.range)}
                icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
                variant="default"
              />
            )}
            {!!scoreContext.consensus && (
              <StatCard
                label="Consensus"
                value={safeStr(scoreContext.consensus)}
                icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
                variant="default"
              />
            )}
            {!!scoreContext.agreement_quality && (
              <StatCard
                label="Agreement"
                value={safeStr(scoreContext.agreement_quality)}
                icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
                variant="primary"
              />
            )}
          </motion.div>
        )}

        {/* Top 3 Reasons */}
        {top3Reasons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            <BlockHeader
              variant="title"
              title="Top 3 Reasons to Pursue"
              icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />}
            />
            <InsightList items={top3Reasons} type="success" numbered />
          </motion.div>
        )}

        {/* Top 3 Risks - Expandable */}
        {top3Risks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <BlockHeader
              variant="title"
              title="Top 3 Risks"
              icon={<FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-0 rounded-lg border border-border bg-card overflow-hidden">
              {top3Risks.map((r, i) => {
                const priority = r.priority_score ?? 0;
                const hasDetails = priority > 0 || r.likelihood || r.impact || r.mitigation;
                if (!hasDetails) {
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 border-b border-border last:border-b-0"
                    >
                      <span className="flex-shrink-0 w-5 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="font-medium text-sm text-foreground leading-snug">
                        {safeStr(r.risk)}
                      </span>
                    </div>
                  );
                }
                return (
                  <Collapsible key={i}>
                    <div className="border-b border-border last:border-b-0">
                      <CollapsibleTrigger asChild>
                        <button className="group w-full flex items-center gap-2 p-3 text-left hover:bg-muted/30 transition-colors cursor-pointer">
                          <span className="flex-shrink-0 w-5 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-transform duration-200 group-data-[state=open]:rotate-90">
                            <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-medium text-sm text-foreground leading-snug flex-1">
                            {safeStr(r.risk)}
                          </span>
                          {priority > 0 && (
                            <Badge className={`flex-shrink-0 text-xs ${getRiskPriorityColor(priority)}`}>
                              P{priority}
                            </Badge>
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pl-10 space-y-3 border-l-2 border-l-amber-500/30 ml-5">
                          {(priority > 0 || r.likelihood || r.impact) && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {priority > 0 ? (
                                <Badge className={getRiskPriorityColor(priority)}>
                                  Priority: {priority}
                                </Badge>
                              ) : null}
                              {r.likelihood ? (
                                <Badge variant="outline">Likelihood: {safeStr(r.likelihood)}</Badge>
                              ) : null}
                              {r.impact ? (
                                <Badge variant="outline">Impact: {safeStr(r.impact)}</Badge>
                              ) : null}
                            </div>
                          )}
                          {r.mitigation ? (
                            <div>
                              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                Mitigation
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {safeStr(r.mitigation)}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Market Snapshot */}
        {marketSnapshot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <BlockHeader
              variant="title"
              title="Market Snapshot"
              icon={<FontAwesomeIcon icon={faGlobe} className="w-5 h-5 text-accent" />}
            />
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="space-y-4">
                {marketSnapshot.segment != null && marketSnapshot.segment !== "" && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Segment</p>
                    <p className="text-sm text-foreground leading-relaxed">{safeStr(marketSnapshot.segment)}</p>
                  </div>
                )}

                {marketSnapshot.size != null && marketSnapshot.size !== "" && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Size</p>
                    <p className="text-sm text-foreground leading-relaxed">{safeStr(marketSnapshot.size)}</p>
                  </div>
                )}

                {marketSnapshot.saturation != null && marketSnapshot.saturation !== "" && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Saturation</p>
                    <p className="text-sm text-foreground leading-relaxed">{safeStr(marketSnapshot.saturation)}</p>
                  </div>
                )}

                {Array.isArray(marketSnapshot.competitors) &&
                  (marketSnapshot.competitors as string[]).length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Competitors</p>
                      <TagCloud tags={marketSnapshot.competitors as string[]} variant="accent" />
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        {nextSteps && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BlockHeader
                variant="title"
                title="Next Steps"
                icon={<FontAwesomeIcon icon={faListCheck} className="w-5 h-5 text-accent" />}
              />
              {nextSteps.phase != null && nextSteps.phase !== "" && (
                <Badge variant="secondary" className="text-xs">{safeStr(nextSteps.phase)}</Badge>
              )}
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="space-y-4">
                {nextSteps.objective != null && nextSteps.objective !== "" && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {safeStr(nextSteps.objective)}
                  </p>
                )}

                {Array.isArray(nextSteps.top_3_actions) &&
                  (nextSteps.top_3_actions as string[]).length > 0 && (
                    <ul className="space-y-2">
                      {(nextSteps.top_3_actions as string[]).map((action, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground">
                          <span className="text-accent font-medium">•</span>
                          <span className="leading-relaxed">{action}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                {!!(nextSteps.success_criteria || nextSteps.timeline) && (
                  <div className="space-y-2 text-sm">
                    {nextSteps.success_criteria != null && nextSteps.success_criteria !== "" && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Success: </span>
                        {safeStr(nextSteps.success_criteria)}
                      </p>
                    )}

                    {nextSteps.timeline != null && nextSteps.timeline !== "" && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Timeline: </span>
                        {safeStr(nextSteps.timeline)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Differentiation */}
        {differentiation && (differentiation.strategy || differentiation.advantage) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            <BlockHeader
              variant="title"
              title="Differentiation"
              icon={<FontAwesomeIcon icon={faTrophy} className="w-5 h-5 text-accent" />}
            />
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="space-y-4">
                {differentiation.strategy && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Strategy</p>
                    <p className="text-sm text-foreground leading-relaxed">{safeStr(differentiation.strategy)}</p>
                  </div>
                )}
                {differentiation.advantage && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Competitive Advantage</p>
                    <p className="text-sm text-foreground leading-relaxed">{safeStr(differentiation.advantage)}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Metrics to Track */}
        {metricsToTrack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28 }}
          >
            <BlockHeader
              variant="title"
              title="Metrics to Track"
              icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.isArray(metricsToTrack.leading) && (metricsToTrack.leading as string[]).length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Leading Indicators</p>
                  <ul className="space-y-2">
                    {(metricsToTrack.leading as string[]).map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="text-green-600 dark:text-green-400 font-medium">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(metricsToTrack.lagging) && (metricsToTrack.lagging as string[]).length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Lagging Indicators</p>
                  <ul className="space-y-2">
                    {(metricsToTrack.lagging as string[]).map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {!!metricsToTrack.month_1_target && (
              <p className="text-sm text-muted-foreground mt-4">
                <span className="font-medium text-foreground">Month 1 Target: </span>
                {safeStr(metricsToTrack.month_1_target)}
              </p>
            )}
          </motion.div>
        )}

        {/* Decision Criteria */}
        {decisionCriteria && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <BlockHeader
              variant="title"
              title="Decision Criteria"
              icon={<FontAwesomeIcon icon={faListCheck} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.isArray(decisionCriteria.go_if) && (decisionCriteria.go_if as string[]).length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-green-600 dark:text-green-400 mb-3 font-medium">
                    Go If
                  </p>
                  <ul className="space-y-2">
                    {(decisionCriteria.go_if as string[]).map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="text-green-600 dark:text-green-400 font-medium">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(decisionCriteria.stop_if) && (decisionCriteria.stop_if as string[]).length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wider text-red-600 dark:text-red-400 mb-3 font-medium">
                    Stop If
                  </p>
                  <ul className="space-y-2">
                    {(decisionCriteria.stop_if as string[]).map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <span className="text-red-600 dark:text-red-400 font-medium">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
};
