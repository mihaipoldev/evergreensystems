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
  faSearch,
  faClock,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { ResearchActionsMenu } from "./ResearchActionsMenu";
import type { ResearchSubject } from "../types";
import { cn } from "@/lib/utils";

type ResearchRowProps = {
  research: ResearchSubject;
  onDelete?: () => void;
  onEdit?: (research: ResearchSubject) => void;
};

export function ResearchRow({
  research,
  onDelete,
  onEdit,
}: ResearchRowProps) {
  const formattedDate = research.last_researched_at
    ? new Date(research.last_researched_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Never";

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <FontAwesomeIcon
            icon={faSearch}
            className="h-4 w-4 text-primary"
          />
        </div>
        <div className={cn(
          "min-w-0 flex flex-col h-full",
          research.description ? "justify-start" : "justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={`/intel/research/${research.id}`}
                className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
              >
                {research.name}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{research.name}</p>
            </TooltipContent>
          </Tooltip>
          {research.category && (
            <Badge variant="secondary" className="w-fit text-xs mt-1">
              {research.category}
            </Badge>
          )}
          {research.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{research.description}</p>
          )}
        </div>
      </div>

      {/* Geography */}
      <div className="w-32 shrink-0">
        {research.geography ? (
          <p className="text-sm text-muted-foreground truncate">{research.geography}</p>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* Type */}
      <div className="w-24 shrink-0">
        {research.type ? (
          <Badge 
            variant="outline" 
            className="w-fit bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15"
          >
            {research.type}
          </Badge>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      {/* Run Count */}
      <div className="w-20 shrink-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={faPlay} className="h-3.5 w-3.5" />
          <span>{research.run_count || 0}</span>
        </div>
      </div>

      {/* Last Researched */}
      <div className="w-28 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <ResearchActionsMenu
            research={research}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
}

