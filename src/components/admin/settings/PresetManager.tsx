"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Plus, MoreHorizontal, Moon, Sun, Monitor, Pencil, Copy, Trash2, CheckCircle, Sparkles } from "lucide-react";
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

type Preset = {
  id: string;
  name: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  theme: string | null;
  favorite?: boolean;
};

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
  // Sort presets: favorites first (by name), then non-favorites (by name)
  const sortedPresets = useMemo(() => {
    const favorites = presets
      .filter(p => p.favorite)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    const nonFavorites = presets
      .filter(p => !p.favorite)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return [...favorites, ...nonFavorites];
  }, [presets]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="text-lg font-semibold mb-1">Preset Manager</h2>
        <p className="text-xs text-muted-foreground">
          Select a preset to preview or apply
        </p>
      </div>

      {/* New Preset Section - Fixed */}
      <div className="p-4 border-b border-border shrink-0 space-y-2">
        <button
          onClick={onCreateNew}
          className={cn(
            "w-full p-3 rounded-lg border-2 border-dashed border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card transition-all duration-200 text-left group flex items-center justify-between gap-3"
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-md border-2 border-border bg-muted flex items-center justify-center group-hover:border-primary/50 transition-colors shrink-0">
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                New Preset
              </div>
            </div>
          </div>
        </button>
        
        {/* Generate with AI Button */}
        {onGeneratePreset && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onGeneratePreset();
            }}
            disabled={isGeneratingPreset}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGeneratingPreset ? "Generating..." : "Generate with AI"}
          </Button>
        )}
      </div>

      {/* Preset Cards List - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 space-y-3">
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
                "w-full p-3 rounded-lg border-2 bg-card transition-all duration-200 group relative flex items-center gap-2",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border/50 hover:border-primary/30 hover:shadow-sm"
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
                      "w-6 h-6 rounded-md border-0 transition-all duration-200",
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
                      "w-6 h-6 rounded-md border-0 transition-all duration-200",
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
                        className="h-7 w-7 shrink-0"
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
