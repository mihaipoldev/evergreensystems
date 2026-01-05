import { Search, Filter, ArrowUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ToolbarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: string[];
  sortOptions?: string[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function Toolbar({ 
  searchPlaceholder = "Search...",
  filters = ["All", "Active", "Archived"],
  sortOptions = ["Recent", "Name", "Size"],
  primaryAction
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Left: Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={searchPlaceholder}
          className="pl-9 h-9 bg-background"
        />
      </div>

      {/* Center: Filters + Sort */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border border-border rounded-md p-1">
          {filters.map((filter, index) => (
            <button
              key={filter}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                index === 0 
                  ? "bg-accent text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>

        <Button variant="outline" size="sm" className="h-9 gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </div>

      {/* Right: Primary Action */}
      {primaryAction && (
        <Button onClick={primaryAction.onClick} size="sm" className="h-9 gap-2">
          <Plus className="h-4 w-4" />
          {primaryAction.label}
        </Button>
      )}
    </div>
  );
}
