"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

type RunInputTooltipProps = {
  runInput: Record<string, unknown> | null;
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
    // Special handling for document_context: array of {name, display_name, document_ids}
    if (key === "document_context" && value.every((v) => typeof v === "object" && v && "display_name" in v)) {
      return (
        <ul className="list-disc list-inside space-y-1 mt-1">
          {value.map((item: Record<string, unknown>, i) => (
            <li key={i}>
              <span className="font-medium">{String(item.display_name ?? item.name ?? "Context")}</span>
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

function RunInputContent({ runInput }: { runInput: Record<string, unknown> }) {
  const aiConfig = runInput.ai_config as Record<string, unknown> | undefined;
  const researchParams = runInput.research_parameters as Record<string, unknown> | undefined;
  const otherKeys = Object.keys(runInput).filter((k) => !["ai_config", "research_parameters"].includes(k));

  return (
    <div className="max-w-[380px] max-h-[420px] overflow-y-auto space-y-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
        Run Input Configuration
      </p>

      {aiConfig && Object.keys(aiConfig).length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground/90 mb-2">AI Config</p>
          <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-2">
            <InputBlock data={aiConfig} compact />
          </div>
        </div>
      )}

      {researchParams && Object.keys(researchParams).length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground/90 mb-2">Research Parameters</p>
          <div className="bg-muted/50 rounded-lg px-3 py-2.5 space-y-2">
            <InputBlock data={researchParams} compact />
          </div>
        </div>
      )}

      {otherKeys.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground/90 mb-2">Other</p>
          <div className="bg-muted/50 rounded-lg px-3 py-2.5">
            <InputBlock data={Object.fromEntries(otherKeys.map((k) => [k, runInput[k]]))} compact />
          </div>
        </div>
      )}
    </div>
  );
}

export function RunInputTooltip({ runInput }: RunInputTooltipProps) {
  if (!runInput || (typeof runInput === "object" && Object.keys(runInput).length === 0)) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="View run input configuration"
          >
            <FontAwesomeIcon icon={faCircleInfo} className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="p-4 max-w-[400px] max-h-[450px] overflow-hidden"
        >
          <RunInputContent runInput={runInput} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
