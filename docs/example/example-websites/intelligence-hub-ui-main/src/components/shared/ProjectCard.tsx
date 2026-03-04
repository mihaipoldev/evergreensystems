import { FolderKanban, MoreHorizontal, Database, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  name: string;
  status: "Active" | "Draft" | "Archived" | "Completed";
  description: string;
  linkedKB?: string;
  taskCount: number;
  updatedAt: string;
  onView: () => void;
  onMenuClick: () => void;
}

export function ProjectCard({
  name,
  status,
  description,
  linkedKB,
  taskCount,
  updatedAt,
  onView,
  onMenuClick
}: ProjectCardProps) {
  const statusColors = {
    Active: "bg-success/10 text-success border-success/20",
    Draft: "bg-muted text-muted-foreground border-border",
    Archived: "bg-muted text-muted-foreground border-border",
    Completed: "bg-primary/10 text-primary border-primary/20"
  };

  return (
    <div className="enterprise-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
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
        <Badge variant="outline" className={statusColors[status]}>
          {status}
        </Badge>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        {linkedKB && (
          <div className="flex items-center gap-1.5 text-sm">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Linked:</span>
            <span className="text-foreground font-medium">{linkedKB}</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {taskCount} tasks
        </p>
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
