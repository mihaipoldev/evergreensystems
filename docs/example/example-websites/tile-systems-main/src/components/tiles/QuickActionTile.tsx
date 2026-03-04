import { LucideIcon } from "lucide-react";
import { BaseTile } from "./BaseTile";

interface QuickActionTileProps {
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function QuickActionTile({ label, description, icon: Icon, onClick }: QuickActionTileProps) {
  return (
    <BaseTile onClick={onClick} className="flex items-center gap-3 p-3">
      <div className="p-2 rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
    </BaseTile>
  );
}
