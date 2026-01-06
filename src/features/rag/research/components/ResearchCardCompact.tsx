"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { ResearchActionsMenu } from "./ResearchActionsMenu";
import type { ResearchSubject } from "../types";

type ResearchCardCompactProps = {
  research: ResearchSubject;
  onDelete?: () => void;
};

export function ResearchCardCompact({
  research,
  onDelete,
}: ResearchCardCompactProps) {
  return (
    <Card className="flex items-center gap-3 p-3 border-none shadow-card-light hover:shadow-card transition-shadow">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <FontAwesomeIcon
          icon={faSearch}
          className="h-3.5 w-3.5 text-primary"
        />
      </div>
      <Link href={`/intel/research/${research.id}`} className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate hover:text-primary transition-colors">
          {research.name}
        </h4>
      </Link>
      {research.category && (
        <Badge variant="secondary" className="text-xs shrink-0">
          {research.category}
        </Badge>
      )}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <FontAwesomeIcon icon={faPlay} className="h-3 w-3" />
        <span>{research.run_count || 0}</span>
      </div>
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <ResearchActionsMenu
          research={research}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
}

