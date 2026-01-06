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
import {
  faClock,
  faDollarSign,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import { WorkflowActionsMenu } from "./WorkflowActionsMenu";
import type { Workflow } from "../types";
import { cn } from "@/lib/utils";

type WorkflowRowProps = {
  workflow: Workflow;
  onDelete?: () => void;
  onEdit?: (workflow: Workflow) => void;
};

export function WorkflowRow({
  workflow,
  onDelete,
  onEdit,
}: WorkflowRowProps) {
  const formattedDate = new Date(workflow.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const enabledColorClass = workflow.enabled
    ? "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20"
    : "bg-muted text-muted-foreground border-border";

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          {workflow.icon ? (
            <span className="text-lg">{workflow.icon}</span>
          ) : (
            <FontAwesomeIcon
              icon={faSitemap}
              className="h-4 w-4 text-primary"
            />
          )}
        </div>
        <div className={cn(
          "min-w-0 flex flex-col h-full",
          workflow.description ? "justify-start" : "justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={`/intel/workflows/${workflow.id}`}
                className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
              >
                {workflow.label}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{workflow.label}</p>
            </TooltipContent>
          </Tooltip>
          {workflow.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{workflow.description}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <Badge variant="outline" className={cn("w-fit", enabledColorClass)}>
          {workflow.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      {/* Cost */}
      <div className="w-20 shrink-0">
        {workflow.estimated_cost !== null ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FontAwesomeIcon icon={faDollarSign} className="h-3.5 w-3.5" />
            <span>${workflow.estimated_cost}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* Time */}
      <div className="w-24 shrink-0">
        {workflow.estimated_time_minutes !== null ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
            <span>{workflow.estimated_time_minutes} min</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* Updated */}
      <div className="w-28 shrink-0">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <WorkflowActionsMenu
            workflow={workflow}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
}

