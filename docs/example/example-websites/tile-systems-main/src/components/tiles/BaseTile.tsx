import { ReactNode } from "react";
import { TileActionMenu } from "./TileActionMenu";

interface BaseTileProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "grid" | "list";
  className?: string;
  actions?: {
    onEdit?: () => void;
    onDuplicate?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
    onOpenExternal?: () => void;
  };
}

export function BaseTile({
  children,
  onClick,
  variant = "grid",
  className = "",
  actions,
}: BaseTileProps) {
  const baseStyles = "tile group relative cursor-pointer animate-fade-in";
  const variantStyles = variant === "grid" 
    ? "p-4" 
    : "px-4 py-3 flex items-center gap-4";

  return (
    <div
      className={`${baseStyles} ${variantStyles} ${className}`}
      onClick={onClick}
    >
      {children}
      {actions && (
        <TileActionMenu
          {...actions}
          className="absolute top-2 right-2"
        />
      )}
    </div>
  );
}
