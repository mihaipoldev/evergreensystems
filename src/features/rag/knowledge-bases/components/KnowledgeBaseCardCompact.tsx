"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faFileText } from "@fortawesome/free-solid-svg-icons";
import type { KnowledgeBase } from "../types";
import { cn } from "@/lib/utils";

type KnowledgeBaseCardCompactProps = {
  knowledge: KnowledgeBase;
  documentCount?: number;
};

export function KnowledgeBaseCardCompact({
  knowledge,
  documentCount = 0,
}: KnowledgeBaseCardCompactProps) {
  const typeColors: Record<string, string> = {
    Vector: "bg-primary/10 text-primary",
    Graph: "bg-green-600/10 text-green-600 dark:text-green-400",
    Hybrid: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400",
  };

  const kbType = knowledge.kb_type || "Vector";
  const typeColorClass = typeColors[kbType] || typeColors.Vector;

  return (
    <Card className="h-full border-0">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <FontAwesomeIcon
              icon={faDatabase}
              className="h-4 w-4 text-primary"
            />
          </div>
          <Link href={`/intel/knowledge-bases/${knowledge.id}`}>
            <h3 className="font-medium text-foreground truncate hover:text-primary transition-colors">
              {knowledge.name}
            </h3>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Badge variant="secondary" className={cn("w-fit", typeColorClass)}>
          {kbType}
        </Badge>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FontAwesomeIcon icon={faFileText} className="h-3.5 w-3.5" />
          <span>{documentCount} docs</span>
        </div>
      </CardContent>
    </Card>
  );
}

