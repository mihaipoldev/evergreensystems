"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faUpDown, faPlus, faTh, faList } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { RAGFilterMenu, type FilterCategory } from "./RAGFilterMenu";
import { RAGSortMenu } from "./RAGSortMenu";

export type ViewMode = "grid" | "table";

interface ToolbarProps {
  searchPlaceholder?: string;
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
  };
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  viewModeStorageKey?: string;
}

export function Toolbar({
  searchPlaceholder = "Search...",
  onSearch,
  filterCategories,
  selectedFilters = {},
  onFilterApply,
  onFilterClear,
  sortOptions = ["Recent", "Name", "Size"],
  onSortChange,
  selectedSort: controlledSelectedSort,
  primaryAction,
  viewMode: controlledViewMode,
  onViewModeChange,
  viewModeStorageKey = "intel-view-mode",
}: ToolbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [internalSelectedSort, setInternalSelectedSort] = useState(sortOptions[0] || "Recent");
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("grid");
  
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
    setSearchValue(value);
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
        <div className="relative w-72">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 !h-3 !w-3 text-muted-foreground"
            style={{ fontSize: '12px', width: '12px', height: '12px' }}
          />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-10 bg-muted/20 shadow-buttons border-0 border-foreground/70"
          />
        </div>
      )}

      {/* Right: Filter + Sort + View Toggle + Primary Action */}
      <div className="flex items-center gap-2">
        {/* Filter Button */}
        {filterCategories && filterCategories.length > 0 && (
          <RAGFilterMenu
            trigger={
              <Button
                variant="outline"
                className={cn(
                  "h-10 gap-2 px-3 bg-muted/20 shadow-buttons border-0 border-foreground/70 text-muted-foreground hover:text-foreground hover:bg-accent/30",
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
                className="h-10 gap-2 px-3 bg-muted/20 shadow-buttons border-0 border-foreground/70 text-muted-foreground hover:text-foreground hover:bg-accent/30"
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

        {/* View Mode Toggle */}
        {(controlledViewMode !== undefined || onViewModeChange) && (
          <div className="flex shadow-buttons bg-muted/20 items-center gap-0 border-0 border-foreground/70 rounded-md p-0 overflow-hidden">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={cn(
                "px-4 h-10 text-sm rounded-none transition-colors flex items-center justify-center",
                viewMode === "grid"
                  ? "bg-primary/30 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid view"
            >
              <FontAwesomeIcon icon={faTh} className="!h-4 !w-4" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            </button>
            <button
              onClick={() => handleViewModeChange("table")}
              className={cn(
                "px-4 h-10 text-sm rounded-none transition-colors flex items-center justify-center",
                viewMode === "table"
                  ? "bg-primary/30 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table view"
            >
              <FontAwesomeIcon icon={faList} className="!h-4 !w-4" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            </button>
          </div>
        )}

        {/* Primary Action */}
        {primaryAction && (
          <Button onClick={primaryAction.onClick} className="shadow-buttons h-10 gap-2 px-3">
            <FontAwesomeIcon icon={faPlus} className="!h-3 !w-3" style={{ fontSize: '12px', width: '12px', height: '12px' }} />
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
