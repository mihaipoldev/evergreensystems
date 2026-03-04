import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DocumentRowProps {
  name: string;
  type: string;
  size: string;
  status: "Indexed" | "Processing" | "Failed" | "Pending";
  knowledgeBase: string;
  uploadedAt: string;
  onView: () => void;
  onMenuClick: () => void;
}

export function DocumentRow({
  name,
  type,
  size,
  status,
  knowledgeBase,
  uploadedAt,
  onView,
  onMenuClick
}: DocumentRowProps) {
  const statusColors = {
    Indexed: "bg-success/10 text-success",
    Processing: "bg-warning/10 text-warning",
    Failed: "bg-destructive/10 text-destructive",
    Pending: "bg-muted text-muted-foreground"
  };

  return (
    <div className="enterprise-card flex items-center gap-4 p-4">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>

      {/* Size */}
      <div className="w-20 shrink-0">
        <p className="text-sm text-muted-foreground">{size}</p>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <Badge variant="secondary" className={statusColors[status]}>
          {status}
        </Badge>
      </div>

      {/* Knowledge Base */}
      <div className="w-32 shrink-0">
        <p className="text-sm text-muted-foreground truncate">{knowledgeBase}</p>
      </div>

      {/* Uploaded */}
      <div className="w-28 shrink-0">
        <p className="text-sm text-muted-foreground">{uploadedAt}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={onView}>
          View
        </Button>
        <button 
          onClick={onMenuClick}
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
