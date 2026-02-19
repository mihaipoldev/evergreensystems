"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChartPie, faGaugeHigh, faCoins } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { ReportMeta } from "../../types/meta";

type RunInputTooltipProps = {
  runInput: Record<string, unknown> | null;
  reportMeta?: ReportMeta | null;
};

function formatValue(value: unknown, key?: string): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground italic">—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (value === "") return <span className="text-muted-foreground italic">(empty)</span>;
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground italic">(none)</span>;
    if (key === "document_context" && value.every((v) => typeof v === "object" && v && "display_name" in v)) {
      return (
        <ul className="list-disc list-inside space-y-1 mt-1">
          {value.map((item: Record<string, unknown>, i) => (
            <li key={i}>
              <span className="font-medium">{String(item.display_name ?? item.name ?? "—")}</span>
              {Array.isArray(item.document_ids) && item.document_ids.length > 0 && (
                <span className="text-muted-foreground text-xs ml-1">
                  ({item.document_ids.length} document{item.document_ids.length !== 1 ? "s" : ""})
                </span>
              )}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <ul className="list-disc list-inside space-y-1 mt-1">
        {value.map((item, i) => (
          <li key={i}>{formatValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return <InputBlock data={value as Record<string, unknown>} />;
  }
  return String(value);
}

function InputBlock({ data, compact = false }: { data: Record<string, unknown>; compact?: boolean }) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return <span className="text-muted-foreground italic">(empty)</span>;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      {entries.map(([key, value]) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const isNested = typeof value === "object" && value !== null && !Array.isArray(value);
        return (
          <div key={key} className={isNested ? "pl-2 border-l-2 border-border/60" : ""}>
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">{label}:</span>
            <div className="mt-0.5">{formatValue(value, key)}</div>
          </div>
        );
      })}
    </div>
  );
}

function formatCost(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  return `$${value.toFixed(4)}`;
}

function ReportInfoContent({
  runInput,
  reportMeta,
}: {
  runInput: Record<string, unknown> | null;
  reportMeta?: ReportMeta | null;
}) {
  const hasRunInput = runInput && typeof runInput === "object" && Object.keys(runInput).length > 0;
  const input = reportMeta?.input as Record<string, string> | undefined;
  const hasMetaInput = input && Object.keys(input).length > 0 && Object.values(input).some((v) => v != null && String(v).trim());
  const domainInsights = reportMeta?.analysis_summary?.domain_insights as Record<string, unknown> | undefined;
  const perAgentConf = reportMeta?.analysis_summary?.per_agent_confidence as
    | Record<string, { score?: number; rationale?: string } | number>
    | undefined;
  const usageMetrics = reportMeta?.usage_metrics;
  const costs = usageMetrics?.costs as Record<string, number> | undefined;
  const hasCosts = costs && (
    costs.research != null ||
    costs.agent_1 != null ||
    costs.agent_2 != null ||
    costs.agent_3 != null ||
    costs.meta != null ||
    costs.total != null ||
    costs.total_research != null ||
    costs.total_synthesis != null
  );
  const perAgent = usageMetrics?.per_agent as Record<string, { total_cost?: number; research_cost?: number; synthesis_cost?: number; queries?: number }> | undefined;
  const hasPerAgent = perAgent && Object.keys(perAgent).length > 0 && Object.values(perAgent).some((a) => a?.total_cost != null);
  const perEval = usageMetrics?.per_evaluation;
  const hasPerEval = perEval && (
    perEval.total_cost != null ||
    (perEval?.breakdown &&
      (perEval.breakdown.research != null ||
        perEval.breakdown.agents != null ||
        perEval.breakdown.meta != null))
  );

  const sections: React.ReactNode[] = [];

  // Run Input
  if (hasRunInput) {
    const aiConfig = runInput!.ai_config as Record<string, unknown> | undefined;
    const researchParams = runInput!.research_parameters as Record<string, unknown> | undefined;
    const otherKeys = Object.keys(runInput!).filter((k) => !["ai_config", "research_parameters"].includes(k));

    sections.push(
      <div key="run-input">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
          Run Input Configuration
        </p>
        <div className="mt-2 space-y-3">
          {aiConfig && Object.keys(aiConfig).length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground/90 mb-1.5">AI Config</p>
              <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-2">
                <InputBlock data={aiConfig} compact />
              </div>
            </div>
          )}
          {researchParams && Object.keys(researchParams).length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground/90 mb-1.5">Research Parameters</p>
              <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-2">
                <InputBlock data={researchParams} compact />
              </div>
            </div>
          )}
          {otherKeys.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground/90 mb-1.5">Other</p>
              <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                <InputBlock data={Object.fromEntries(otherKeys.map((k) => [k, runInput![k]]))} compact />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else if (hasMetaInput) {
    sections.push(
      <div key="input">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
          Input
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {input!.niche_name && (
            <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-medium">
              Niche: {input!.niche_name}
            </span>
          )}
          {(input!.geography ?? input!.geo) && (
            <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-medium">
              Geo: {String(input!.geography ?? input!.geo)}
            </span>
          )}
          {input!.notes && (
            <span className="text-xs text-muted-foreground">Notes: {input!.notes}</span>
          )}
          {input!.run_id && (
            <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-mono">
              Run: {String(input!.run_id).slice(0, 8)}…
            </span>
          )}
        </div>
      </div>
    );
  }

  // Domain Insights (dynamic per automation)
  if (domainInsights && Object.keys(domainInsights).length > 0) {
    sections.push(
      <div key="domain-insights">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 flex items-center gap-2">
          <FontAwesomeIcon icon={faChartPie} className="w-3.5 h-3.5" />
          Domain Insights
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(domainInsights).map(([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium"
            >
              {k.replace(/_/g, " ")}: {String(v)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Per-Agent Confidence
  if (perAgentConf && Object.keys(perAgentConf).length > 0) {
    const entries = Object.entries(perAgentConf).filter(([k]) => k !== "average");
    if (entries.length > 0) {
      sections.push(
        <div key="agent-confidence">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 flex items-center gap-2">
            <FontAwesomeIcon icon={faGaugeHigh} className="w-3.5 h-3.5" />
            Agent Confidence
          </p>
          <div className="mt-2 space-y-2">
            {entries.map(([key, val]) => {
              const v = val as { score?: number; rationale?: string } | number;
              const score = typeof v === "object" && v && "score" in v ? v.score : typeof v === "number" ? v : null;
              const rationale = typeof v === "object" && v && "rationale" in v ? v.rationale : undefined;
              return (
                <div key={key} className="flex justify-between items-start gap-3 p-2 rounded-lg bg-muted/20 text-sm">
                  <span className="font-medium capitalize shrink-0">{key.replace(/_/g, " ")}</span>
                  <div className="text-right min-w-0">
                    {score != null && <span className="font-semibold">{score}%</span>}
                    {rationale && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2" title={rationale}>
                        {rationale}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {typeof perAgentConf.average === "number" && (
              <div className="pt-2 border-t border-border font-medium text-sm">
                Average: {perAgentConf.average}%
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Costs
  if (hasCosts || hasPerEval || hasPerAgent) {
    sections.push(
      <div key="costs">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5 flex items-center gap-2">
          <FontAwesomeIcon icon={faCoins} className="w-3.5 h-3.5" />
          Costs
        </p>
        <div className="mt-2 space-y-3">
          {hasCosts && costs && (
            <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-1.5">
              {costs.research != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Research</span>
                  <span>{formatCost(costs.research)}</span>
                </div>
              )}
              {costs.total_research != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Research</span>
                  <span>{formatCost(costs.total_research)}</span>
                </div>
              )}
              {costs.total_synthesis != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Synthesis</span>
                  <span>{formatCost(costs.total_synthesis)}</span>
                </div>
              )}
              {costs.agent_1 != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agent 1</span>
                  <span>{formatCost(costs.agent_1)}</span>
                </div>
              )}
              {costs.agent_2 != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agent 2</span>
                  <span>{formatCost(costs.agent_2)}</span>
                </div>
              )}
              {costs.agent_3 != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agent 3</span>
                  <span>{formatCost(costs.agent_3)}</span>
                </div>
              )}
              {costs.meta != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meta</span>
                  <span>{formatCost(costs.meta)}</span>
                </div>
              )}
              {costs.total != null && (
                <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/60">
                  <span>Total</span>
                  <span>{formatCost(costs.total)}</span>
                </div>
              )}
            </div>
          )}
          {hasPerAgent && perAgent && (
            <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-1.5">
              {Object.entries(perAgent).map(([agentName, agentData]) =>
                agentData?.total_cost != null ? (
                  <div key={agentName} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{agentName.replace(/_/g, " ")}</span>
                    <span>{formatCost(agentData.total_cost)}</span>
                  </div>
                ) : null
              )}
            </div>
          )}
          {hasPerEval && perEval && (
            <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-1.5">
              {perEval.total_cost != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Per Evaluation</span>
                  <span>{formatCost(perEval.total_cost)}</span>
                </div>
              )}
              {perEval.breakdown && (
                <>
                  {perEval.breakdown.research != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Research</span>
                      <span>{formatCost(perEval.breakdown.research)}</span>
                    </div>
                  )}
                  {perEval.breakdown.agents != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Agents</span>
                      <span>{formatCost(perEval.breakdown.agents)}</span>
                    </div>
                  )}
                  {perEval.breakdown.meta != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meta</span>
                      <span>{formatCost(perEval.breakdown.meta)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (sections.length === 0) return null;

  return (
    <div className="max-w-[380px] max-h-[480px] overflow-y-auto space-y-5 text-sm">
      {sections}
    </div>
  );
}

export function RunInputTooltip({ runInput, reportMeta }: RunInputTooltipProps) {
  const hasRunInput = runInput && typeof runInput === "object" && Object.keys(runInput).length > 0;
  const costsForMeta = reportMeta?.usage_metrics?.costs as Record<string, number> | undefined;
  const hasReportMeta =
    reportMeta &&
    ((reportMeta.input && Object.keys(reportMeta.input).length > 0) ||
      (reportMeta.analysis_summary?.domain_insights && Object.keys(reportMeta.analysis_summary.domain_insights).length > 0) ||
      (reportMeta.analysis_summary?.per_agent_confidence && Object.keys(reportMeta.analysis_summary.per_agent_confidence).length > 0) ||
      (reportMeta.usage_metrics &&
        ((costsForMeta?.total != null) ||
          (costsForMeta?.total_research != null) ||
          (reportMeta.usage_metrics.per_evaluation?.total_cost != null) ||
          (reportMeta.usage_metrics.per_agent && Object.keys(reportMeta.usage_metrics.per_agent).length > 0))));

  if (!hasRunInput && !hasReportMeta) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="View report info"
          >
            <FontAwesomeIcon icon={faCircleInfo} className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="p-4 max-w-[420px] max-h-[500px] overflow-hidden"
        >
          <ReportInfoContent runInput={runInput} reportMeta={reportMeta} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
