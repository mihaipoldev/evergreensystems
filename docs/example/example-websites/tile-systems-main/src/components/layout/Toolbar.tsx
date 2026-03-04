import { Search, Plus, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

interface FilterPill {
  id: string;
  label: string;
  active: boolean;
}

interface ToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterPill[];
  onFilterClick?: (id: string) => void;
  onNewClick?: () => void;
  newLabel?: string;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  showViewToggle?: boolean;
}

export function Toolbar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  onFilterClick,
  onNewClick,
  newLabel = "New",
  viewMode = "grid",
  onViewModeChange,
  showViewToggle = true,
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {/* Left: Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9 h-9 bg-secondary/50 border-transparent focus:border-border focus:bg-background"
          />
        </div>

        {/* Center: Filter pills */}
        {filters.length > 0 && (
          <div className="flex items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterClick?.(filter.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  filter.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* Right: View toggle + New button */}
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              <Toggle
                pressed={viewMode === "grid"}
                onPressedChange={() => onViewModeChange?.("grid")}
                size="sm"
                className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                pressed={viewMode === "list"}
                onPressedChange={() => onViewModeChange?.("list")}
                size="sm"
                className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                <List className="h-3.5 w-3.5" />
              </Toggle>
            </div>
          )}
          {onNewClick && (
            <Button onClick={onNewClick} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {newLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
