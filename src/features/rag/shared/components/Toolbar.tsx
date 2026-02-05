"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faUpDown, faPlus, faFolder, faLayerGroup, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { RAGFilterMenu, type FilterCategory } from "./RAGFilterMenu";
import { RAGSortMenu } from "./RAGSortMenu";
import { RAGGroupMenu } from "./RAGGroupMenu";

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
  /** Renders after Sort button (e.g. Generate button for project runs) */
  actionAfterSort?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  showProjectsToggle?: {
    show: boolean;
    onToggle: (show: boolean) => void;
  };
  groupBySource?: {
    options: {
      value: string;
      label: string;
    }[];
    selectedValue?: string;
    onSelect: (value: string) => void;
  };
  groupByStatus?: {
    options: {
      value: string;
      label: string;
    }[];
    selectedValue?: string;
    onSelect: (value: string) => void;
  };
  groupByVerdict?: {
    options: {
      value: string;
      label: string;
    }[];
    selectedValue?: string;
    onSelect: (value: string) => void;
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
  actionAfterSort,
  showProjectsToggle,
  groupBySource,
  groupByStatus,
  groupByVerdict,
}: ToolbarProps) {
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [internalSelectedSort, setInternalSelectedSort] = useState(sortOptions[0] || "Recent");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
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

  const handleSearchChange = (value: string) => {
    if (!controlledSearchValue) {
      setInternalSearchValue(value);
    }
    onSearch?.(value);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

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
        <>
          {/* Mobile: Search - Icon or Expanding Input */}
          <div className="md:hidden flex items-center gap-2 flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {!isSearchExpanded ? (
                <motion.div
                  key="search-icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchExpanded(true)}
                    className="h-10 w-10 p-0 border-0 shadow-none bg-transparent hover:bg-transparent shrink-0"
                    title="Search"
                  >
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className={cn(
                        "!h-4 !w-4",
                        searchValue && searchValue.length > 0 ? "text-primary" : "text-foreground/80"
                      )}
                      style={{ fontSize: '16px', width: '16px', height: '16px' }}
                    />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="search-input"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative flex-1 min-w-0"
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 !h-3 !w-3 text-muted-foreground z-10"
                    style={{ fontSize: '12px', width: '12px', height: '12px' }}
                  />
                  <Input
                    ref={searchInputRef}
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onBlur={(e) => {
                      // Only collapse if input is empty and not focused
                      if (!e.target.value && !e.relatedTarget) {
                        setIsSearchExpanded(false);
                      }
                    }}
                    className="pl-9 h-10 bg-transparent border-0 shadow-none text-foreground/80 focus:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop: Search Input */}
          <div className="hidden md:block relative w-72 bg-card/90 shadow-buttons rounded-md">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 !h-3 !w-3 text-muted-foreground z-10"
              style={{ fontSize: '12px', width: '12px', height: '12px' }}
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-10 bg-transparent border-0 !shadow-none dark:!shadow-none hover:!shadow-none dark:hover:!shadow-none text-foreground/80 focus:text-foreground focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </>
      )}

      {/* Right: Filter + Sort + View Toggle + Primary Action */}
      <div className="flex items-center gap-0 md:gap-2">

        {/* Secondary Action (Generate) */}
        {secondaryAction && !secondaryAction.disabled && (
            <Button
              onClick={secondaryAction.onClick} 
              className="relative h-10 w-10 md:h-10 md:w-10 p-0 overflow-hidden border-0 shadow-none bg-transparent hover:bg-transparent md:bg-accent md:hover:bg-accent transition-all duration-300 hover:scale-105"
              onMouseEnter={(e) => {
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.boxShadow = '0 5px 6px -2px hsl(var(--accent) / 0.1), 0 3px 3px -2px hsl(var(--accent) / 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.boxShadow = '0 3px 5px -2px hsl(var(--accent) / 0.0), 0 4px 6px -2px hsl(var(--accent) / 0.0)';
                }
              }}
              title={secondaryAction.label}
            >
            {/* Animated shimmer effect - desktop only */}
            <div 
              className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" 
              style={{
                animation: 'shimmer 8s infinite'
              }}
            />
            <FontAwesomeIcon 
              icon={faWandMagicSparkles} 
              className="relative z-10 !h-4 !w-4 md:drop-shadow-lg text-foreground/80 md:text-foreground"
              style={{ fontSize: '16px', width: '16px', height: '16px' }} 
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
                  "h-10 w-10 md:h-10 md:w-auto md:gap-2 md:px-3 p-0 border-0 shadow-none bg-transparent hover:bg-transparent md:bg-card/90 md:shadow-buttons md:hover:bg-card/100 md:hover:shadow-card transition-all duration-300",
                  hasActiveFilters 
                    ? "text-primary/80 hover:text-primary [&[data-state=open]]:text-primary [&[data-state=open]]:hover:text-primary" 
                    : "text-foreground/80 md:text-foreground/80 hover:text-foreground [&[data-state=open]]:text-foreground [&[data-state=open]]:hover:text-foreground"
                )}
                title={`Filter${hasActiveFilters ? ` (${Object.values(selectedFilters).flat().length})` : ''}`}
              >
                <FontAwesomeIcon icon={faFilter} className="!h-4 !w-4 md:!h-3 md:!w-3" style={{ fontSize: '16px', width: '16px', height: '16px' }} />
                <span className="hidden md:inline">Filter {hasActiveFilters && `(${Object.values(selectedFilters).flat().length})`}</span>
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
                className="h-10 w-10 md:h-10 md:w-auto md:gap-2 md:px-3 p-0 border-0 shadow-none bg-transparent hover:bg-transparent md:bg-card/90 md:shadow-buttons md:hover:bg-card/100 md:hover:shadow-card transition-all duration-300 text-foreground/80 md:text-foreground/80 hover:text-foreground [&[data-state=open]]:text-foreground [&[data-state=open]]:hover:text-foreground"
                title={`Sort${selectedSort ? ` (${selectedSort})` : ''}`}
              >
                <FontAwesomeIcon icon={faUpDown} className="!h-4 !w-4 md:!h-3 md:!w-3" style={{ fontSize: '16px', width: '16px', height: '16px' }} />
                <span className="hidden md:inline">Sort {selectedSort && `(${selectedSort})`}</span>
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
              "h-10 w-10 md:h-10 md:w-auto md:gap-2 md:px-3 p-0 border-0 shadow-none bg-transparent hover:bg-transparent transition-all duration-300 md:bg-card/90 md:shadow-buttons md:hover:bg-card/100 md:hover:shadow-card",
              showProjectsToggle.show
                ? "text-primary md:bg-primary/100 md:text-background md:shadow-card md:hover:bg-primary/90 md:hover:text-background"
                : "text-foreground/80 md:text-foreground/80 md:hover:text-foreground"
            )}
            title={showProjectsToggle.show ? "Hide project knowledge bases" : "Show project knowledge bases"}
          >
            <FontAwesomeIcon icon={faFolder} className="!h-4 !w-4 md:!h-3 md:!w-3" style={{ fontSize: '16px', width: '16px', height: '16px' }} />
            <span className="hidden md:inline">Projects</span>
          </Button>
        )}

        {/* Group By Source */}
        {groupBySource && groupBySource.options && (
          <RAGGroupMenu
            trigger={
              <Button
                variant="outline"
                className={cn(
                  "h-10 w-10 md:h-10 md:w-auto md:gap-2 md:px-3 p-0 border-0 shadow-none bg-transparent hover:bg-transparent md:bg-card/90 md:shadow-buttons md:hover:bg-card/100 md:hover:shadow-card transition-all duration-300",
                  "hover:text-foreground [&[data-state=open]]:hover:text-foreground",
                  groupBySource.selectedValue && groupBySource.selectedValue !== "none"
                    ? "text-primary md:text-foreground"
                    : "text-foreground/80 md:text-foreground/80 [&[data-state=open]]:text-foreground"
                )}
                title={`Group${groupBySource.selectedValue && groupBySource.selectedValue !== "none" ? ` (${groupBySource.options.find(opt => opt.value === groupBySource.selectedValue)?.label || ""})` : ''}`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="!h-4 !w-4 md:!h-3 md:!w-3" style={{ fontSize: '16px', width: '16px', height: '16px' }} />
                <span className="hidden md:inline">Group {groupBySource.selectedValue && groupBySource.selectedValue !== "none" && `(${groupBySource.options.find(opt => opt.value === groupBySource.selectedValue)?.label || ""})`}</span>
              </Button>
            }
            options={groupBySource.options}
            selectedValue={groupBySource.selectedValue}
            onSelect={groupBySource.onSelect}
            width="w-48"
          />
        )}

        {/* Group By Status */}
        {groupByStatus && groupByStatus.options && (
          <RAGGroupMenu
            trigger={
              <Button
                variant="outline"
                className={cn(
                  "h-10 w-10 md:h-10 md:w-auto md:gap-2 md:px-3 p-0 border-0 shadow-none bg-transparent hover:bg-transparent md:bg-card/90 md:shadow-buttons md:hover:bg-card/100 md:hover:shadow-card transition-all duration-300",
                  "hover:text-foreground [&[data-state=open]]:hover:text-foreground",
                  groupByStatus.selectedValue && groupByStatus.selectedValue !== "none"
                    ? "text-primary md:text-foreground"
                    : "text-foreground/80 md:text-foreground/80 [&[data-state=open]]:text-foreground"
                )}
                title={`Group${groupByStatus.selectedValue && groupByStatus.selectedValue !== "none" ? ` (${groupByStatus.options.find(opt => opt.value === groupByStatus.selectedValue)?.label || ""})` : ''}`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="!h-4 !w-4 md:!h-3 md:!w-3" style={{ fontSize: '16px', width: '16px', height: '16px' }} />
                <span className="hidden md:inline">Group {groupByStatus.selectedValue && groupByStatus.selectedValue !== "none" && `(${groupByStatus.options.find(opt => opt.value === groupByStatus.selectedValue)?.label || ""})`}</span>
              </Button>
            }
            options={groupByStatus.options}
            selectedValue={groupByStatus.selectedValue}
            onSelect={groupByStatus.onSelect}
            width="w-48"
          />
        )}

        {/* Group By Verdict */}
        {groupByVerdict && groupByVerdict.options && (
          <RAGGroupMenu
            trigger={
              <Button
                variant="outline"
                className={cn(
                  "h-10 w-10 md:h-10 md:w-auto md:gap-2 md:px-3 p-0 border-0 shadow-none bg-transparent hover:bg-transparent md:bg-card/90 md:shadow-buttons md:hover:bg-card/100 md:hover:shadow-card transition-all duration-300",
                  "hover:text-foreground [&[data-state=open]]:hover:text-foreground",
                  groupByVerdict.selectedValue && groupByVerdict.selectedValue !== "none"
                    ? "text-primary md:text-foreground"
                    : "text-foreground/80 md:text-foreground/80 [&[data-state=open]]:text-foreground"
                )}
                title={`Group${groupByVerdict.selectedValue && groupByVerdict.selectedValue !== "none" ? ` (${groupByVerdict.options.find(opt => opt.value === groupByVerdict.selectedValue)?.label || ""})` : ''}`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="!h-4 !w-4 md:!h-3 md:!w-3" style={{ fontSize: '16px', width: '16px', height: '16px' }} />
                <span className="hidden md:inline">Group {groupByVerdict.selectedValue && groupByVerdict.selectedValue !== "none" && `(${groupByVerdict.options.find(opt => opt.value === groupByVerdict.selectedValue)?.label || ""})`}</span>
              </Button>
            }
            options={groupByVerdict.options}
            selectedValue={groupByVerdict.selectedValue}
            onSelect={groupByVerdict.onSelect}
            width="w-48"
          />
        )}

        {/* Action after Sort (e.g. Generate for project runs) - rightmost */}
        {actionAfterSort && !actionAfterSort.disabled && (
          <Button
            onClick={actionAfterSort.onClick}
            className="relative h-10 w-10 md:h-10 md:w-10 p-0 overflow-hidden border-0 shadow-none bg-transparent hover:bg-transparent md:bg-primary md:hover:bg-primary md:shadow-buttons md:hover:shadow-card transition-all duration-300 hover:scale-105 text-foreground/80 md:text-primary-foreground"
            title={actionAfterSort.label}
          >
            <div
              className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
              style={{ animation: "shimmer 8s infinite" }}
            />
            <FontAwesomeIcon
              icon={faWandMagicSparkles}
              className="relative z-10 !h-4 !w-4 md:drop-shadow-lg"
              style={{ fontSize: "16px", width: "16px", height: "16px" }}
            />
          </Button>
        )}

        {/* Primary Action */}
        {primaryAction && !primaryAction.disabled && (
          <Button 
            onClick={primaryAction.onClick} 
            className="h-10 w-10 md:h-10 md:w-auto ml-1.5 md:ml-0 md:gap-2 md:px-3 p-0 border-0 shadow-buttons md:shadow-buttons"
            title={primaryAction.label}
          >
            <FontAwesomeIcon icon={faPlus} className="!h-4 !w-4 md:!h-3 md:!w-3" style={{ fontSize: '16px', width: '16px', height: '16px' }} />
            <span className="hidden md:inline">{primaryAction.label}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
