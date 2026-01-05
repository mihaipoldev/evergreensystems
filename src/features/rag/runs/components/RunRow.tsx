"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faDatabase, faClock } from "@fortawesome/free-solid-svg-icons";
import type { Run } from "../types";
import { cn } from "@/lib/utils";

type RunRowProps = {
  run: Run & { knowledge_base_name?: string | null };
  onView?: () => void;
};

export function RunRow({ run, onView }: RunRowProps) {
  const formattedDate = new Date(run.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusColors: Record<string, string> = {
    queued: "bg-muted text-muted-foreground",
    collecting: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400",
    ingesting: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
    generating: "bg-purple-600/10 text-purple-600 dark:text-purple-400",
    complete: "bg-green-600/10 text-green-600 dark:text-green-400",
    failed: "bg-destructive/10 text-destructive",
  };

  const statusColorClass = statusColors[run.status] || statusColors.queued;

  const runTypeLabels: Record<string, string> = {
    niche_intelligence: "Niche Intelligence",
    kb_query: "KB Query",
    doc_ingest: "Document Ingest",
  };

  const runTypeLabel = runTypeLabels[run.run_type] || run.run_type;

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faPlay} className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex flex-col h-full justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={`/intel/runs/${run.id}`}
                className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
              >
                {runTypeLabel}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{runTypeLabel}</p>
            </TooltipContent>
          </Tooltip>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {run.knowledge_base_name || "Unknown KB"}
          </p>
        </div>
      </div>

      {/* Type */}
      <div className="w-32 shrink-0">
        <Badge variant="outline" className="w-fit capitalize">
          {runTypeLabel}
        </Badge>
      </div>

      {/* Status */}
      <div className="w-28 shrink-0">
        <Badge variant="secondary" className={cn("w-fit capitalize", statusColorClass)}>
          {run.status}
        </Badge>
      </div>

      {/* Knowledge Base */}
      <div className="w-32 shrink-0">
        <p className="text-sm text-muted-foreground truncate">
          {run.knowledge_base_name || "—"}
        </p>
      </div>

      {/* Created */}
      <div className="w-36 shrink-0">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        {/* Actions menu can be added here if needed */}
      </div>
    </Card>
  );
}

