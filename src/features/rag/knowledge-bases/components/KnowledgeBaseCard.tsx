"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faFileText,
  faClock,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { KnowledgeBaseActionsMenu } from "./KnowledgeBaseActionsMenu";
import type { KnowledgeBase } from "../types";
import { cn } from "@/lib/utils";

type KnowledgeBaseCardProps = {
  knowledge: KnowledgeBase;
  documentCount?: number;
  onDelete?: () => void;
  onEdit?: (knowledgeBase: KnowledgeBase) => void;
};

export function KnowledgeBaseCard({
  knowledge,
  documentCount = 0,
  onDelete,
  onEdit,
}: KnowledgeBaseCardProps) {
  const formattedDate = new Date(knowledge.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate size (placeholder - would need to calculate from documents)
  const size = "0 MB"; // TODO: Calculate from documents if needed

  const typeColors: Record<string, string> = {
    Vector: "bg-primary/10 text-primary",
    Graph: "bg-green-600/10 text-green-600 dark:text-green-400",
    Hybrid: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400",
  };

  const kbType = knowledge.kb_type || "Vector";
  const typeColorClass = typeColors[kbType] || typeColors.Vector;

  return (
    <Card className="flex flex-col h-full border-none shadow-card-light hover:shadow-card hover:bg-card/70 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 shadow-icon">
            <FontAwesomeIcon
              icon={faDatabase}
              className="h-4 w-4 text-primary"
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/intel/knowledge-bases/${knowledge.id}`} className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate hover:text-primary transition-colors cursor-pointer">{knowledge.name}</h3>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{knowledge.name}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <KnowledgeBaseActionsMenu
            knowledgeBase={knowledge}
            knowledgeBaseName={knowledge.name}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="flex-1 p-4 pt-1 space-y-3">
        <Badge variant="secondary" className={cn("w-fit", typeColorClass)}>
          {kbType}
        </Badge>
        {knowledge.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {knowledge.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faFileText} className="h-3.5 w-3.5" />
            <span>{documentCount} docs</span>
          </div>
          <span className="text-border">•</span>
          <span>{size}</span>
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
