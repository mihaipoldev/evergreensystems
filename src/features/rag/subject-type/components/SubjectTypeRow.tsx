"use client";

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
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { SubjectTypeActionsMenu } from "./SubjectTypeActionsMenu";
import type { SubjectType } from "../types";
import { cn } from "@/lib/utils";

type SubjectTypeRowProps = {
  subjectType: SubjectType;
  onDelete?: () => void;
  onEdit?: (subjectType: SubjectType) => void;
};

export function SubjectTypeRow({
  subjectType,
  onDelete,
  onEdit,
}: SubjectTypeRowProps) {
  const formattedDate = new Date(subjectType.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          {subjectType.icon ? (
            <span className="text-lg">{subjectType.icon}</span>
          ) : (
            <FontAwesomeIcon
              icon={faTag}
              className="h-4 w-4 text-primary"
            />
          )}
        </div>
        <div className={cn(
          "min-w-0 flex flex-col h-full",
          subjectType.description ? "justify-start" : "justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium text-foreground truncate cursor-pointer">
                {subjectType.label}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{subjectType.label}</p>
            </TooltipContent>
          </Tooltip>
          <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{subjectType.name}</p>
          {subjectType.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{subjectType.description}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <Badge
          variant="secondary"
          className={cn(
            "w-fit",
            subjectType.enabled
              ? "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {subjectType.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      {/* Updated */}
      <div className="w-28 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <SubjectTypeActionsMenu
            subjectType={subjectType}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
}

