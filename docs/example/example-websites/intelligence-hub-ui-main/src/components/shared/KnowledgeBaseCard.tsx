import { Database, MoreHorizontal, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface KnowledgeBaseCardProps {
  name: string;
  type: "Vector" | "Graph" | "Hybrid";
  description: string;
  documentCount: number;
  size: string;
  updatedAt: string;
  onView: () => void;
  onMenuClick: () => void;
}

export function KnowledgeBaseCard({
  name,
  type,
  description,
  documentCount,
  size,
  updatedAt,
  onView,
  onMenuClick
}: KnowledgeBaseCardProps) {
  const typeColors = {
    Vector: "bg-primary/10 text-primary",
    Graph: "bg-success/10 text-success",
    Hybrid: "bg-warning/10 text-warning"
  };

  return (
    <div className="enterprise-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground truncate">{name}</h3>
        </div>
        <button 
          onClick={onMenuClick}
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors shrink-0"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-3">
        <Badge variant="secondary" className={typeColors[type]}>
          {type}
        </Badge>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>{documentCount} docs</span>
          </div>
          <span className="text-border">•</span>
          <span>{size}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{updatedAt}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onView}>
          View
        </Button>
      </div>
    </div>
  );
}
