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
  faDatabase,
  faClock,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { KnowledgeBaseActionsMenu } from "./KnowledgeBaseActionsMenu";
import type { KnowledgeBase } from "../types";
import { cn } from "@/lib/utils";

type KnowledgeBaseRowProps = {
  knowledge: KnowledgeBase;
  documentCount?: number;
  onDelete?: () => void;
  onEdit?: (knowledgeBase: KnowledgeBase) => void;
};

export function KnowledgeBaseRow({
  knowledge,
  documentCount = 0,
  onDelete,
  onEdit,
}: KnowledgeBaseRowProps) {
  const formattedDate = new Date(knowledge.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate size (placeholder)
  const size = "0 MB";

  const typeColors: Record<string, string> = {
    Vector: "bg-primary/10 text-primary",
    Graph: "bg-green-600/10 text-green-600 dark:text-green-400",
    Hybrid: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400",
  };

  const kbType = knowledge.kb_type || "Vector";
  const typeColorClass = typeColors[kbType] || typeColors.Vector;

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <FontAwesomeIcon
            icon={faDatabase}
            className="h-4 w-4 text-primary"
          />
        </div>
        <div className={cn(
          "min-w-0 flex flex-col h-full",
          knowledge.description ? "justify-start" : "justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={`/intel/knowledge-bases/${knowledge.id}`}
                className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
              >
                {knowledge.name}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{knowledge.name}</p>
            </TooltipContent>
          </Tooltip>
          {knowledge.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{knowledge.description}</p>
          )}
        </div>
      </div>

      {/* Type */}
      <div className="w-24 shrink-0">
        <Badge variant="secondary" className={cn("w-fit", typeColorClass)}>
          {kbType}
        </Badge>
      </div>

      {/* Document Count */}
      <div className="w-20 shrink-0">
        <p className="text-sm text-muted-foreground">{documentCount} docs</p>
      </div>

      {/* Size */}
      <div className="w-20 shrink-0">
        <p className="text-sm text-muted-foreground">{size}</p>
      </div>

      {/* Updated */}
      <div className="w-28 shrink-0">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end">
        <div onClick={(e) => e.stopPropagation()}>
          <KnowledgeBaseActionsMenu
            knowledgeBase={knowledge}
            knowledgeBaseName={knowledge.name}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
}

