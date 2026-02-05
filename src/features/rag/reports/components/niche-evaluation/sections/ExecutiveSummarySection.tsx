"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faExclamationTriangle,
  faBullseye,
  faListCheck,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { InsightList } from "../../shared/InsightList";
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
            className="space-y-4"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-accent" />
              Score Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scoreContext.range ? (
                <StatCard
                  label="Range"
                  value={safeStr(scoreContext.range)}
                  icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
                  variant="default"
                />
              ) : null}
              {scoreContext.consensus ? (
                <StatCard
                  label="Consensus"
                  value={safeStr(scoreContext.consensus)}
                  icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
                  variant="default"
                />
              ) : null}
              {scoreContext.agreement_quality ? (
                <StatCard
                  label="Agreement"
                  value={safeStr(scoreContext.agreement_quality)}
                  icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
                  variant="primary"
                />
              ) : null}
            </div>
          </motion.div>
        )}

        {/* Top 3 Reasons */}
        {top3Reasons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="space-y-4"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-green-600 dark:text-green-400" />
              Top 3 Reasons to Pursue
            </h3>
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
            className="space-y-2"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Top 3 Risks
            </h3>
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
            className="space-y-4"
          >
            <div className="rounded-lg border border-border bg-card p-5 space-y-4 report-shadow">
              {marketSnapshot.segment != null && marketSnapshot.segment !== "" ? (
                <div>
                  <p className="font-semibold text-foreground mb-1">Segment</p>
                  <p className="text-sm text-muted-foreground">{safeStr(marketSnapshot.segment)}</p>
                </div>
              ) : null}
              
              {marketSnapshot.size != null && marketSnapshot.size !== "" ? (
                <div>
                  <p className="font-semibold text-foreground mb-1">Size</p>
                  <p className="text-sm text-muted-foreground">{safeStr(marketSnapshot.size)}</p>
                </div>
              ) : null}
              
              {marketSnapshot.saturation != null && marketSnapshot.saturation !== "" ? (
                <div>
                  <p className="font-semibold text-foreground mb-1">Saturation</p>
                  <p className="text-sm text-muted-foreground">{safeStr(marketSnapshot.saturation)}</p>
                </div>
              ) : null}
              
              {Array.isArray(marketSnapshot.competitors) &&
                (marketSnapshot.competitors as string[]).length > 0 && (
                  <div>
                    <p className="font-semibold text-foreground mb-1">Competitors</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {(marketSnapshot.competitors as string[]).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
            className="space-y-4"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <FontAwesomeIcon icon={faListCheck} className="w-5 h-5 text-accent" />
              Next Steps
            </h3>
            <div className="rounded-lg border border-border bg-card p-5 space-y-4 report-shadow">
              {nextSteps.phase != null && nextSteps.phase !== "" ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Phase
                  </p>
                  <Badge variant="secondary">{safeStr(nextSteps.phase)}</Badge>
                </div>
              ) : null}
              
              {nextSteps.objective != null && nextSteps.objective !== "" ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Objective
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {safeStr(nextSteps.objective)}
                  </p>
                </div>
              ) : null}

              {Array.isArray(nextSteps.top_3_actions) &&
                (nextSteps.top_3_actions as string[]).length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Top 3 Actions
                    </p>
                    <InsightList items={nextSteps.top_3_actions as string[]} type="accent" numbered />
                  </div>
                )}

              {nextSteps.success_criteria != null && nextSteps.success_criteria !== "" ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Success Criteria
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {safeStr(nextSteps.success_criteria)}
                  </p>
                </div>
              ) : null}

              {nextSteps.timeline != null && nextSteps.timeline !== "" ? (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Timeline
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {safeStr(nextSteps.timeline)}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  );
};
