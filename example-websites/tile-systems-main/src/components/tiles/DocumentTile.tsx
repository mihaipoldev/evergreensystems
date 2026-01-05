import { FileText, Clock } from "lucide-react";
import { BaseTile } from "./BaseTile";

interface DocumentTileProps {
  id: string;
  name: string;
  source: string;
  status: "processed" | "processing" | "failed";
  chunkCount: number;
  knowledgeBase?: string;
  project?: string;
  lastUpdated: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  processed: { label: "Processed", className: "status-badge status-active" },
  processing: { label: "Processing", className: "status-badge status-pending" },
  failed: { label: "Failed", className: "status-badge bg-destructive/10 text-destructive" },
};

export function DocumentTile({
  name,
  source,
  status,
  chunkCount,
  knowledgeBase,
  project,
  lastUpdated,
  onClick,
  onEdit,
  onDelete,
}: DocumentTileProps) {
  const statusInfo = statusConfig[status];

  return (
    <BaseTile
      variant="list"
      onClick={onClick}
      actions={{ onEdit, onDelete }}
      className="py-2.5"
    >
      <div className="p-1.5 rounded bg-secondary shrink-0">
        <FileText className="h-3.5 w-3.5 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
      </div>
      <div className="flex items-center gap-4 text-xs shrink-0">
        <span className="text-muted-foreground font-mono truncate max-w-[120px]">{source}</span>
        <span className={statusInfo.className}>{statusInfo.label}</span>
        <span className="font-mono text-muted-foreground">{chunkCount} chunks</span>
        {knowledgeBase && <span className="chip">{knowledgeBase}</span>}
        {project && <span className="chip">{project}</span>}
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {lastUpdated}
        </span>
      </div>
    </BaseTile>
  );
}
