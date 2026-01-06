"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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

type SubjectTypeCardProps = {
  subjectType: SubjectType;
  onDelete?: () => void;
  onEdit?: (subjectType: SubjectType) => void;
};

export function SubjectTypeCard({
  subjectType,
  onDelete,
  onEdit,
}: SubjectTypeCardProps) {
  const formattedDate = new Date(subjectType.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const enabledColorClass = subjectType.enabled
    ? "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20"
    : "bg-muted text-muted-foreground border-border";

  return (
    <Card className="flex flex-col h-full border-none shadow-card-light hover:shadow-card hover:bg-card/70 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 shadow-icon">
            {subjectType.icon ? (
              <span className="text-lg">{subjectType.icon}</span>
            ) : (
              <FontAwesomeIcon
                icon={faTag}
                className="h-4 w-4 text-primary"
              />
            )}
          </div>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">{subjectType.label}</h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{subjectType.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <SubjectTypeActionsMenu
            subjectType={subjectType}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex-1 p-4 pt-1 space-y-3">
        <Badge variant="secondary" className={cn("w-fit", enabledColorClass)}>
          {subjectType.enabled ? "Enabled" : "Disabled"}
        </Badge>
        <p className="text-xs text-muted-foreground font-mono">{subjectType.name}</p>
        {subjectType.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {subjectType.description}
          </p>
        )}
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

