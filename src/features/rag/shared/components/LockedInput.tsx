import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LockedInputProps {
  label: string;
  value: string;
  className?: string;
  showLockedBadge?: boolean;
}

/**
 * LockedInput - A read-only input field with a locked badge
 * Used for displaying locked/pre-filled values that cannot be edited
 */
export function LockedInput({
  label,
  value,
  className,
  showLockedBadge = true,
}: LockedInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
        <span className="text-sm font-medium text-foreground flex-1">{value || "—"}</span>
        {showLockedBadge && (
          <Badge variant="secondary" className="text-xs shrink-0">
            Locked
          </Badge>
        )}
      </div>
    </div>
  );
}

