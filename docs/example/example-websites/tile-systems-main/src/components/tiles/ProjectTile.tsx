import { Folder, Clock } from "lucide-react";
import { BaseTile } from "./BaseTile";

interface ProjectTileProps {
  id: string;
  name: string;
  status: "active" | "pending" | "archived";
  knowledgeBase?: string;
  documentCount: number;
  lastUpdated: string;
  variant?: "grid" | "list";
  onClick?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  active: { label: "Active", className: "status-badge status-active" },
  pending: { label: "Pending", className: "status-badge status-pending" },
  archived: { label: "Archived", className: "status-badge status-archived" },
};

export function ProjectTile({
  name,
  status,
  knowledgeBase,
  documentCount,
  lastUpdated,
  variant = "grid",
  onClick,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: ProjectTileProps) {
  const statusInfo = statusConfig[status];

  if (variant === "list") {
    return (
      <BaseTile
        variant="list"
        onClick={onClick}
        actions={{ onEdit, onDuplicate, onArchive, onDelete }}
      >
        <div className="p-2 rounded-lg bg-secondary shrink-0">
          <Folder className="h-4 w-4 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
        </div>
        <div className="flex items-center gap-6 text-sm shrink-0">
          <span className={statusInfo.className}>{statusInfo.label}</span>
          {knowledgeBase && (
            <span className="chip text-xs">{knowledgeBase}</span>
          )}
          <span className="font-mono text-xs text-muted-foreground">{documentCount} docs</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {lastUpdated}
          </span>
        </div>
      </BaseTile>
    );
  }

  return (
    <BaseTile
      variant="grid"
      onClick={onClick}
      actions={{ onEdit, onDuplicate, onArchive, onDelete }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-secondary">
          <Folder className="h-5 w-5 text-foreground" />
        </div>
        <span className={statusInfo.className}>{statusInfo.label}</span>
      </div>
      <h3 className="font-medium text-sm mb-2 truncate pr-6">{name}</h3>
      {knowledgeBase && (
        <div className="mb-2">
          <span className="chip text-xs">{knowledgeBase}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span className="font-mono">{documentCount} docs</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lastUpdated}
        </span>
      </div>
    </BaseTile>
  );
}
