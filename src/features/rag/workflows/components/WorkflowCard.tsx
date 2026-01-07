"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faDollarSign,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import { WorkflowActionsMenu } from "./WorkflowActionsMenu";
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
import type { Workflow } from "../types";
import { cn } from "@/lib/utils";

type WorkflowCardProps = {
  workflow: Workflow;
  onDelete?: () => void;
  onEdit?: (workflow: Workflow) => void;
};

export function WorkflowCard({
  workflow,
  onDelete,
  onEdit,
}: WorkflowCardProps) {
  const formattedDate = new Date(workflow.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Map status to color using the shared config
  function getStatusColor(status: string): string {
    return statusColorMap[status] || "muted";
  }

  const statusColor = getStatusColor(workflow.enabled ? "enabled" : "disabled");

  return (
    <Card className="flex flex-col h-full border-none shadow-card-light hover:shadow-card hover:bg-card/70 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 shadow-icon">
            {workflow.icon ? (
              <span className="text-lg">{workflow.icon}</span>
            ) : (
              <FontAwesomeIcon
                icon={faSitemap}
                className="h-4 w-4 text-primary"
              />
            )}
          </div>
          <Link href={`/intel/workflows/${workflow.id}`} className="flex-1 min-w-0">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">{workflow.label}</h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{workflow.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <WorkflowActionsMenu
            workflow={workflow}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex-1 p-4 pt-1 space-y-3">
        <StatusBadge 
          color={statusColor}
        >
          {workflow.enabled ? "Enabled" : "Disabled"}
        </StatusBadge>
        {workflow.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workflow.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {workflow.estimated_cost !== null && (
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faDollarSign} className="h-3.5 w-3.5" />
              <span>${workflow.estimated_cost}</span>
            </div>
          )}
          {workflow.estimated_time_minutes !== null && (
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
              <span>{workflow.estimated_time_minutes} min</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center p-4 bg-muted/50">
        <div className="flex items-center h-2 gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

