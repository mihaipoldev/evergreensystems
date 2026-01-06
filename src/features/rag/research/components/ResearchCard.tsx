"use client";

import Link from "next/link";
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
  faSearch,
  faClock,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { ResearchActionsMenu } from "./ResearchActionsMenu";
import type { ResearchSubject } from "../types";
import { cn } from "@/lib/utils";

type ResearchCardProps = {
  research: ResearchSubject;
  onDelete?: () => void;
  onEdit?: (research: ResearchSubject) => void;
};

export function ResearchCard({
  research,
  onDelete,
  onEdit,
}: ResearchCardProps) {
  const formattedDate = new Date(research.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="flex flex-col h-full border-none shadow-card-light hover:shadow-card hover:bg-card/70 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 shadow-icon">
            <FontAwesomeIcon
              icon={faSearch}
              className="h-4 w-4 text-primary"
            />
          </div>
          <Link href={`/intel/research/${research.id}`} className="flex-1 min-w-0">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">{research.name}</h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{research.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <ResearchActionsMenu
            research={research}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex-1 p-4 pt-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          {research.category && (
            <Badge variant="secondary" className="w-fit">
              {research.category}
            </Badge>
          )}
          {research.geography && (
            <Badge variant="outline" className="w-fit">
              {research.geography}
            </Badge>
          )}
          {research.type && (
            <Badge variant="outline" className="w-fit">
              {research.type}
            </Badge>
          )}
        </div>
        {research.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {research.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={faPlay} className="h-3.5 w-3.5" />
          <span>{research.run_count || 0} {research.run_count === 1 ? "run" : "runs"}</span>
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

