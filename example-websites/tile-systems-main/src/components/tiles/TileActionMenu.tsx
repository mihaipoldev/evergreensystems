import { MoreHorizontal, Pencil, Copy, Trash2, Archive, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TileActionMenuProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onOpenExternal?: () => void;
  className?: string;
}

export function TileActionMenu({
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onOpenExternal,
  className = "",
}: TileActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onOpenExternal && (
          <DropdownMenuItem onClick={onOpenExternal} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open in new tab
          </DropdownMenuItem>
        )}
        {onDuplicate && (
          <DropdownMenuItem onClick={onDuplicate} className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
        )}
        {onArchive && (
          <DropdownMenuItem onClick={onArchive} className="gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
