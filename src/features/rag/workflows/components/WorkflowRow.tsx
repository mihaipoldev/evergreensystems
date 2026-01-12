"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
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
import { StatusBadge } from "@/features/rag/shared/components/StatusBadge";
import { statusColorMap } from "@/features/rag/shared/config/statusColors";
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

  // Map status to color using the shared config
  function getStatusColor(status: string): string {
    return statusColorMap[status] || "muted";
  }

  const statusColor = getStatusColor(workflow.enabled ? "enabled" : "disabled");

  return (
    <>
      {/* Mobile Layout */}
      <Card className="md:hidden border-none shadow-none hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow p-3">
        <Link
          href={`/intel/workflows/${workflow.id}`}
          className="contents"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-action-menu]")) {
              e.preventDefault();
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              {workflow.icon ? (
                <span className="text-lg">{workflow.icon}</span>
              ) : (
                <FontAwesomeIcon
                  icon={faSitemap}
                  className="h-5 w-5 text-primary"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base break-words">
                {workflow.label}
              </div>
              {workflow.description && (
                <div className="text-sm text-muted-foreground mt-0.5 break-words">
                  {workflow.description}
                </div>
              )}
              <div className="text-sm text-muted-foreground space-y-0 mt-2">
                <div>
                  <StatusBadge color={statusColor}>
                    {workflow.enabled ? "Enabled" : "Disabled"}
                  </StatusBadge>
                </div>
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
                <div>{formattedDate}</div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2" data-action-menu>
              <WorkflowActionsMenu
                workflow={workflow}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            </div>
          </div>
        </Link>
      </Card>

      {/* Desktop Layout */}
      <Card className="hidden md:flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow h-20">
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
          <StatusBadge 
            color={statusColor}
          >
            {workflow.enabled ? "Enabled" : "Disabled"}
          </StatusBadge>
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
    </>
  );
}

