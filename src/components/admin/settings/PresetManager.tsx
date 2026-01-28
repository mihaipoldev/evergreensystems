"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Plus, MoreHorizontal, Moon, Sun, Monitor, Pencil, Copy, Trash2, CheckCircle, Sparkles, ArrowUpDown } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Preset = {
  id: string;
  name: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  theme: string | null;
  favorite?: boolean;
  created_at?: string;
};

type SortOption = "name" | "created_at";

interface PresetManagerProps {
  presets: Preset[];
  selectedPresetId: string | null;
  activePresetId: string | null; // Currently applied preset for the environment
  onPresetSelect: (presetId: string) => void;
  onApplyPreset: () => void;
  onCreateNew: () => void;
  isApplying: boolean;
  onRenamePreset?: (presetId: string) => void;
  onDuplicatePreset?: (presetId: string) => void;
  onDeletePreset?: (presetId: string) => void;
  onGenerateName?: (presetId: string) => void;
  onGeneratePreset?: () => void;
  isGeneratingPreset?: boolean;
  onActivatePreset?: (presetId: string) => void;
  onToggleFavorite?: (presetId: string, isFavorite: boolean) => void;
}

export function PresetManager({
  presets,
  selectedPresetId,
  activePresetId,
  onPresetSelect,
  onApplyPreset,
  onCreateNew,
  isApplying,
  onRenamePreset,
  onDuplicatePreset,
  onDeletePreset,
  onGenerateName,
  onGeneratePreset,
  isGeneratingPreset = false,
  onActivatePreset,
  onToggleFavorite,
}: PresetManagerProps) {
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Sort presets: favorites first (sorted by selected option), then non-favorites (sorted by selected option)
  const sortedPresets = useMemo(() => {
    const sortFunction = (a: Preset, b: Preset) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else {
        // Sort by created_at (newest first)
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate; // Descending order (newest first)
      }
    };

    const favorites = presets
      .filter(p => p.favorite)
      .sort(sortFunction);
    const nonFavorites = presets
      .filter(p => !p.favorite)
      .sort(sortFunction);
    return [...favorites, ...nonFavorites];
  }, [presets, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Preset Manager</h2>
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted/50 hover:text-foreground"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sort presets</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setSortBy("name")}
                    className={cn(
                      "cursor-pointer",
                      sortBy === "name" && "text-primary !hover:text-primary font-medium"
                    )}
                  >
                    Sort by name
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortBy("created_at")}
                    className={cn(
                      "cursor-pointer",
                      sortBy === "created_at" && "text-primary !hover:text-primary font-medium"
                    )}
                  >
                    Sort by created date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onCreateNew}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-muted/50 hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Preset</p>
                </TooltipContent>
              </Tooltip>
              {onGeneratePreset && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGeneratePreset();
                      }}
                      disabled={isGeneratingPreset}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted/50 hover:text-foreground"
                    >
                      <Sparkles className={cn("h-4 w-4", isGeneratingPreset && "animate-spin")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isGeneratingPreset ? "Generating..." : "Generate with AI"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Preset Cards List - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-4 px-2 space-y-1">
        {/* Preset Cards */}
        {sortedPresets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const isActive = activePresetId === preset.id;
          const theme = preset.theme || 'dark';
          const themeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

          return (
            <div
              key={preset.id}
              className={cn(
                "w-full p-3 rounded-lg transition-all duration-200 group relative flex items-center gap-2",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "hover:border-primary/30"
              )}
            >
              <button
                onClick={() => onPresetSelect(preset.id)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onActivatePreset) {
                    onActivatePreset(preset.id);
                  }
                }}
                className="flex-1 min-w-0 flex items-center gap-2 text-left"
              >
                {/* Left: Preset Name and Theme */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <span className="truncate">{preset.name}</span>
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onToggleFavorite(preset.id, !preset.favorite);
                        }}
                        className={cn(
                          "shrink-0 transition-colors",
                          preset.favorite
                            ? "text-primary hover:text-primary/80"
                            : "text-muted-foreground hover:text-primary"
                        )}
                        title={preset.favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <FontAwesomeIcon
                          icon={preset.favorite ? faStarSolid : faStarRegular}
                          className="h-3.5 w-3.5"
                        />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isActive && (
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-primary" />
                        <span className="text-[10px] text-primary font-medium">Active</span>
                      </div>
                    )}
                    {/* Theme Indicator */}
                    <div className="flex items-center gap-1">
                      {themeIcon === Moon && <Moon className="h-3 w-3 text-muted-foreground" />}
                      {themeIcon === Sun && <Sun className="h-3 w-3 text-muted-foreground" />}
                      {themeIcon === Monitor && <Monitor className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {theme === 'system' ? 'System' : theme}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Right: Color Swatches and Menu */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Color Swatches */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Primary Color (left) */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-0 transition-all duration-200",
                      isSelected
                        ? "border-white shadow-md"
                        : "border-white/80 group-hover:border-white"
                    )}
                    style={{
                      backgroundColor: preset.primary_color_hex || "#cccccc",
                    }}
                  />
                  {/* Secondary Color (right) */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full border-0 transition-all duration-200",
                      isSelected
                        ? "border-white shadow-md"
                        : "border-white/80 group-hover:border-white"
                    )}
                    style={{
                      backgroundColor: preset.secondary_color_hex || "#cccccc",
                    }}
                  />
                </div>

                {/* Three Dots Menu */}
                {(onRenamePreset || onDuplicatePreset || onDeletePreset || onGenerateName) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="!h-6 !w-6 hover:bg-transparent rounded-full hover:bg-muted/50 hover:text-foreground shrink-0 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onActivatePreset && preset.id !== activePresetId && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onActivatePreset(preset.id);
                        }}
                        className="cursor-pointer"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Apply
                      </DropdownMenuItem>
                    )}
                    {(onRenamePreset || onDuplicatePreset || onDeletePreset || onGenerateName) && (
                      <>
                        {onActivatePreset && preset.id !== activePresetId && <DropdownMenuSeparator />}
                        {onGenerateName && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onGenerateName(preset.id);
                            }}
                            className="cursor-pointer"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Name
                          </DropdownMenuItem>
                        )}
                        {onRenamePreset && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onRenamePreset(preset.id);
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                        )}
                        {onDuplicatePreset && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicatePreset(preset.id);
                            }}
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        {onDeletePreset && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePreset(preset.id);
                              }}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
