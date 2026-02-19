"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { UsageMetrics } from "@/features/rag/reports/types";

type UsageMetricsSectionProps = {
  usageMetrics: UsageMetrics | null | undefined;
};

function formatCost(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  return `$${value.toFixed(4)}`;
}

function UsageMetricsContent({ usageMetrics }: { usageMetrics: UsageMetrics }) {
  const hasCosts = usageMetrics.costs && (
    usageMetrics.costs.research != null ||
    usageMetrics.costs.agent_1 != null ||
    usageMetrics.costs.agent_2 != null ||
    usageMetrics.costs.agent_3 != null ||
    usageMetrics.costs.meta != null ||
    usageMetrics.costs.total != null
  );
  const hasPerEval = usageMetrics.per_evaluation && (
    usageMetrics.per_evaluation.total_cost != null ||
    (usageMetrics.per_evaluation.breakdown && (
      usageMetrics.per_evaluation.breakdown.research != null ||
      usageMetrics.per_evaluation.breakdown.agents != null ||
      usageMetrics.per_evaluation.breakdown.meta != null
    ))
  );

  if (!hasCosts && !hasPerEval) {
    return (
      <p className="text-sm text-muted-foreground italic">No usage data available</p>
    );
  }

  return (
    <div className="max-w-[340px] space-y-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
        Usage Metrics
      </p>

      {hasCosts && usageMetrics.costs && (
        <div>
          <p className="text-xs font-medium text-foreground/90 mb-2">Costs</p>
          <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-1.5">
            {usageMetrics.costs.research != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Research</span>
                <span>{formatCost(usageMetrics.costs.research)}</span>
              </div>
            )}
            {usageMetrics.costs.agent_1 != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent 1</span>
                <span>{formatCost(usageMetrics.costs.agent_1)}</span>
              </div>
            )}
            {usageMetrics.costs.agent_2 != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent 2</span>
                <span>{formatCost(usageMetrics.costs.agent_2)}</span>
              </div>
            )}
            {usageMetrics.costs.agent_3 != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent 3</span>
                <span>{formatCost(usageMetrics.costs.agent_3)}</span>
              </div>
            )}
            {usageMetrics.costs.meta != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meta</span>
                <span>{formatCost(usageMetrics.costs.meta)}</span>
              </div>
            )}
            {usageMetrics.costs.total != null && (
              <div className="flex justify-between font-medium pt-1 border-t border-border/60">
                <span>Total</span>
                <span>{formatCost(usageMetrics.costs.total)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {hasPerEval && usageMetrics.per_evaluation && (
        <div>
          <p className="text-xs font-medium text-foreground/90 mb-2">Per Evaluation</p>
          <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-1.5">
            {usageMetrics.per_evaluation.total_cost != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost</span>
                <span>{formatCost(usageMetrics.per_evaluation.total_cost)}</span>
              </div>
            )}
            {usageMetrics.per_evaluation.breakdown && (
              <>
                {usageMetrics.per_evaluation.breakdown.research != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Research</span>
                    <span>{formatCost(usageMetrics.per_evaluation.breakdown.research)}</span>
                  </div>
                )}
                {usageMetrics.per_evaluation.breakdown.agents != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agents</span>
                    <span>{formatCost(usageMetrics.per_evaluation.breakdown.agents)}</span>
                  </div>
                )}
                {usageMetrics.per_evaluation.breakdown.meta != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meta</span>
                    <span>{formatCost(usageMetrics.per_evaluation.breakdown.meta)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function UsageMetricsSection({ usageMetrics }: UsageMetricsSectionProps) {
  if (!usageMetrics) return null;

  const hasAny =
    (usageMetrics.costs && usageMetrics.costs.total != null) ||
    (usageMetrics.per_evaluation && usageMetrics.per_evaluation.total_cost != null);

  if (!hasAny) return null;

  const summaryParts: string[] = [];
  if (usageMetrics.costs?.total != null) {
    summaryParts.push(formatCost(usageMetrics.costs.total));
  }
  const summary = summaryParts.join(" • ");

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="View usage metrics"
          >
            <FontAwesomeIcon icon={faChartSimple} className="w-3 h-3" />
            <span>{summary || "—"}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="p-4 max-w-[380px] max-h-[450px] overflow-auto"
        >
          <UsageMetricsContent usageMetrics={usageMetrics} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
