"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faUpDown, faPlus, faTh, faList, faFolder, faLayerGroup, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { RAGFilterMenu, type FilterCategory } from "./RAGFilterMenu";
import { RAGSortMenu } from "./RAGSortMenu";

export type ViewMode = "grid" | "table";

interface ToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filterCategories?: FilterCategory[];
  selectedFilters?: Record<string, string[]>;
  onFilterApply?: (filters: Record<string, string[]>) => void;
  onFilterClear?: () => void;
  sortOptions?: string[];
  onSortChange?: (sort: string) => void;
  selectedSort?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  viewModeStorageKey?: string;
  showViewModeToggle?: boolean;
  showProjectsToggle?: {
    show: boolean;
    onToggle: (show: boolean) => void;
  };
  groupBySource?: {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
  };
  groupByStatus?: {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
  };
  groupByVerdict?: {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
  };
}

export function Toolbar({
  searchPlaceholder = "Search...",
  searchValue: controlledSearchValue,
  onSearch,
  filterCategories,
  selectedFilters = {},
  onFilterApply,
  onFilterClear,
  sortOptions = ["Recent", "Name", "Size"],
  onSortChange,
  selectedSort: controlledSelectedSort,
  primaryAction,
  secondaryAction,
  viewMode: controlledViewMode,
  onViewModeChange,
  viewModeStorageKey = "intel-view-mode",
  showViewModeToggle = true,
  showProjectsToggle,
  groupBySource,
  groupByStatus,
  groupByVerdict,
}: ToolbarProps) {
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [internalSelectedSort, setInternalSelectedSort] = useState(sortOptions[0] || "Recent");
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("grid");
  
  // Use controlled or uncontrolled search
  const searchValue = controlledSearchValue ?? internalSearchValue;

  // Sync internal search value when controlled value changes
  useEffect(() => {
    if (controlledSearchValue !== undefined) {
      setInternalSearchValue(controlledSearchValue);
    }
  }, [controlledSearchValue]);

  // Use controlled or uncontrolled sort
  const selectedSort = controlledSelectedSort ?? internalSelectedSort;

  // Use controlled or uncontrolled view mode
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;

  // Load view mode from localStorage on mount
  useEffect(() => {
    if (!controlledViewMode && !onViewModeChange) {
      const saved = localStorage.getItem(viewModeStorageKey) as ViewMode | null;
      if (saved === "grid" || saved === "table") {
        setInternalViewMode(saved);
      }
    }
  }, [controlledViewMode, onViewModeChange, viewModeStorageKey]);

  // Save view mode to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (!controlledViewMode && !onViewModeChange) {
      localStorage.setItem(viewModeStorageKey, mode);
    }
  };

  const handleSearchChange = (value: string) => {
    if (!controlledSearchValue) {
      setInternalSearchValue(value);
    }
    onSearch?.(value);
  };

  const handleSortChange = (sort: string) => {
    if (!controlledSelectedSort) {
      setInternalSelectedSort(sort);
    }
    onSortChange?.(sort);
  };

  const handleFilterApply = (filters: Record<string, string[]>) => {
    onFilterApply?.(filters);
  };

  const handleFilterClear = () => {
    onFilterClear?.();
  };

  const hasActiveFilters = filterCategories 
    ? Object.values(selectedFilters).some((filters) => filters.length > 0)
    : false;

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Search */}
      {onSearch && (
        <div className="relative w-72 bg-card/90 shadow-buttons rounded-md transition-all duration-300 focus-within:bg-card/100 focus-within:shadow-card">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 !h-3 !w-3 text-muted-foreground z-10"
            style={{ fontSize: '12px', width: '12px', height: '12px' }}
          />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-10 bg-transparent border-0 text-foreground/80 focus:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      )}

      {/* Right: Filter + Sort + View Toggle + Primary Action */}
      <div className="flex items-center gap-2">

        {/* Secondary Action (Generate) */}
        {secondaryAction && !secondaryAction.disabled && (
            <Button
              onClick={secondaryAction.onClick} 
              className="relative h-10 w-10 p-0 overflow-hidden border-0 shadow-none transition-all duration-300 hover:scale-105 bg-accent hover:bg-accent text-foreground"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 5px 6px -2px hsl(var(--accent) / 0.1), 0 3px 3px -2px hsl(var(--accent) / 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 3px 5px -2px hsl(var(--accent) / 0.0), 0 4px 6px -2px hsl(var(--accent) / 0.0)';
              }}
              title={secondaryAction.label}
            >
            {/* Animated shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" 
              style={{
                animation: 'shimmer 8s infinite'
              }}
            />
            <FontAwesomeIcon 
              icon={faWandMagicSparkles} 
              className="relative z-10 !h-5 !w-5 drop-shadow-lg text-foreground" 
              style={{ fontSize: '20px', width: '20px', height: '20px' }} 
            />
          </Button>
        )}
        
        {/* Filter Button */}
        {filterCategories && filterCategories.length > 0 && (
          <RAGFilterMenu
            trigger={
              <Button
                variant="outline"
                className={cn(
                  "h-10 gap-2 px-3 bg-card/90 shadow-buttons border-0 text-foreground/80 hover:text-foreground hover:bg-card/100 hover:shadow-card transition-all duration-300",
                  hasActiveFilters && "text-foreground"
                )}
              >
                <FontAwesomeIcon icon={faFilter} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
                Filter {hasActiveFilters && `(${Object.values(selectedFilters).flat().length})`}
              </Button>
            }
            categories={filterCategories}
            selectedFilters={selectedFilters}
            onApply={handleFilterApply}
            onClear={handleFilterClear}
            width="w-64"
          />
        )}

        {/* Sort Button */}
        {sortOptions.length > 0 && (
          <RAGSortMenu
            trigger={
              <Button
                variant="outline"
                className="h-10 gap-2 px-3 bg-card/90 shadow-buttons border-0 text-foreground/80 hover:text-foreground hover:bg-card/100 hover:shadow-card transition-all duration-300"
              >
                <FontAwesomeIcon icon={faUpDown} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
                Sort {selectedSort && `(${selectedSort})`}
              </Button>
            }
            options={sortOptions.map((option) => ({ value: option, label: option }))}
            selectedValue={selectedSort}
            onSelect={handleSortChange}
            width="w-48"
          />
        )}

        {/* Show Projects Toggle */}
        {showProjectsToggle && (
          <Button
            variant="outline"
            onClick={() => showProjectsToggle.onToggle(!showProjectsToggle.show)}
            className={cn(
              "h-10 gap-2 px-3 transition-all duration-300",
              showProjectsToggle.show
                ? "bg-primary/100 text-background shadow-card border-0 hover:bg-primary/90 hover:text-background"
                : "bg-card/90 shadow-buttons border-0 text-foreground/80 hover:text-foreground hover:bg-card/100 hover:shadow-card"
            )}
            title={showProjectsToggle.show ? "Hide project knowledge bases" : "Show project knowledge bases"}
          >
            <FontAwesomeIcon icon={faFolder} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            Projects
          </Button>
        )}

        {/* Group By Source Toggle */}
        {groupBySource && (
          <Button
            variant="outline"
            onClick={() => groupBySource.onToggle(!groupBySource.enabled)}
            className={cn(
              "h-10 gap-2 px-3 transition-all duration-300",
              groupBySource.enabled
                ? "bg-primary/100 text-background shadow-card border-0 hover:bg-primary/90 hover:text-background"
                : "bg-card/90 shadow-buttons border-0 text-foreground/80 hover:text-foreground hover:bg-card/100 hover:shadow-card"
            )}
            title={groupBySource.enabled ? "Ungroup documents" : "Group by workspace/linked"}
          >
            <FontAwesomeIcon icon={faLayerGroup} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            Group
          </Button>
        )}

        {/* Group By Status Toggle */}
        {groupByStatus && (
          <Button
            variant="outline"
            onClick={() => groupByStatus.onToggle(!groupByStatus.enabled)}
            className={cn(
              "h-10 gap-2 px-3 transition-all duration-300",
              groupByStatus.enabled
                ? "bg-primary/100 text-background shadow-card border-0 hover:bg-primary/90 hover:text-background"
                : "bg-card/90 shadow-buttons border-0 text-foreground/80 hover:text-foreground hover:bg-card/100 hover:shadow-card"
            )}
            title={groupByStatus.enabled ? "Ungroup runs" : "Group by status"}
          >
            <FontAwesomeIcon icon={faLayerGroup} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            Group
          </Button>
        )}

        {/* Group By Verdict Toggle */}
        {groupByVerdict && (
          <Button
            variant="outline"
            onClick={() => groupByVerdict.onToggle(!groupByVerdict.enabled)}
            className={cn(
              "h-10 gap-2 px-3 transition-all duration-300",
              groupByVerdict.enabled
                ? "bg-primary/100 text-background shadow-card border-0 hover:bg-primary/90 hover:text-background"
                : "bg-card/90 shadow-buttons border-0 text-foreground/80 hover:text-foreground hover:bg-card/100 hover:shadow-card"
            )}
            title={groupByVerdict.enabled ? "Ungroup projects" : "Group by verdict"}
          >
            <FontAwesomeIcon icon={faLayerGroup} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            Group
          </Button>
        )}

        {/* View Mode Toggle */}
        {showViewModeToggle && (controlledViewMode !== undefined || onViewModeChange) && (
          <div className="flex shadow-buttons bg-card/90 items-center gap-0 border-0 rounded-md p-0 overflow-hidden">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={cn(
                "px-4 h-10 text-sm rounded-none transition-all duration-300 flex items-center justify-center",
                viewMode === "grid"
                  ? "bg-primary/100 text-background shadow-card"
                  : "text-foreground/80 hover:text-foreground shadow-buttons bg-card/80 hover:bg-card/100 hover:shadow-card"
              )}
              title="Grid view"
            >
              <FontAwesomeIcon icon={faTh} className="!h-4 !w-4" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            </button>
            <button
              onClick={() => handleViewModeChange("table")}
              className={cn(
                "px-4 h-10 text-sm rounded-none transition-all duration-300 flex items-center justify-center",
                viewMode === "table"
                  ? "bg-primary/100 text-background shadow-card"
                  : "text-foreground/80 hover:text-foreground hover:bg-card/100 hover:shadow-card"
              )}
              title="Table view"
            >
              <FontAwesomeIcon icon={faList} className="!h-4 !w-4" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            </button>
          </div>
        )}

        {/* Primary Action */}
        {primaryAction && !primaryAction.disabled && (
          <Button 
            onClick={primaryAction.onClick} 
            className="shadow-buttons h-10 gap-2 px-3"
          >
            <FontAwesomeIcon icon={faPlus} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
