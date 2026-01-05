import { LucideIcon, BookOpen, FileText, Database, Clock } from "lucide-react";
import { BaseTile } from "./BaseTile";

interface KnowledgeBaseTileProps {
  id: string;
  name: string;
  type: "docs" | "files" | "database";
  documentCount: number;
  chunkCount: number;
  lastUpdated: string;
  variant?: "grid" | "list";
  onClick?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const typeIcons: Record<string, LucideIcon> = {
  docs: BookOpen,
  files: FileText,
  database: Database,
};

const typeLabels: Record<string, string> = {
  docs: "Documentation",
  files: "Files",
  database: "Database",
};

export function KnowledgeBaseTile({
  name,
  type,
  documentCount,
  chunkCount,
  lastUpdated,
  variant = "grid",
  onClick,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: KnowledgeBaseTileProps) {
  const Icon = typeIcons[type];

  if (variant === "list") {
    return (
      <BaseTile
        variant="list"
        onClick={onClick}
        actions={{ onEdit, onDuplicate, onArchive, onDelete }}
      >
        <div className="p-2 rounded-lg bg-secondary shrink-0">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
          <span className="chip">{typeLabels[type]}</span>
          <span className="font-mono text-xs">{documentCount} docs</span>
          <span className="font-mono text-xs">{chunkCount.toLocaleString()} chunks</span>
          <span className="flex items-center gap-1 text-xs">
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
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <span className="chip">{typeLabels[type]}</span>
      </div>
      <h3 className="font-medium text-sm mb-2 truncate pr-6">{name}</h3>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-mono">{documentCount} docs</span>
        <span className="font-mono">{chunkCount.toLocaleString()} chunks</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
        <Clock className="h-3 w-3" />
        <span>{lastUpdated}</span>
      </div>
    </BaseTile>
  );
}
