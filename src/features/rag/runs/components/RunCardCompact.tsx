"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import type { Run } from "../types";
import { cn } from "@/lib/utils";

type RunCardCompactProps = {
  run: Run & { knowledge_base_name?: string | null };
};

export function RunCardCompact({ run }: RunCardCompactProps) {
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
    <Card className="h-full border-0">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <FontAwesomeIcon
              icon={faPlay}
              className="h-4 w-4 text-primary"
            />
          </div>
          <h3 className="font-medium text-foreground truncate">
            {runTypeLabel}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Badge variant="secondary" className={cn("w-fit capitalize", statusColorClass)}>
          {run.status}
        </Badge>
        <div className="text-sm text-muted-foreground">
          <span>{run.knowledge_base_name || "Unknown KB"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

