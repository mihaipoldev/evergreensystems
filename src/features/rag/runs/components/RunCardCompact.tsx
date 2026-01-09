"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import type { Run } from "../types";
import { getRunLabel } from "../types";
import { cn } from "@/lib/utils";
import { getRunStatusBadgeClasses } from "@/features/rag/shared/utils/runStatusColors";

type RunCardCompactProps = {
  run: Run & { knowledge_base_name?: string | null };
};

export function RunCardCompact({ run }: RunCardCompactProps) {
  // Use utility for status badge classes
  const statusColorClass = getRunStatusBadgeClasses(run.status);

  // Use workflow label if available
  const runLabel = getRunLabel(run);

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
          <h3 className="font-medium text-foreground truncate min-w-0 flex-1">
            {runLabel}
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

