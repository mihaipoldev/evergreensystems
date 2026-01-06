"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface FilterCategory {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
}

interface RAGFilterMenuProps {
  trigger: ReactNode;
  categories: FilterCategory[];
  selectedFilters: Record<string, string[]>;
  onApply: (filters: Record<string, string[]>) => void;
  onClear: () => void;
  width?: string;
}

export function RAGFilterMenu({
  trigger,
  categories,
  selectedFilters,
  onApply,
  onClear,
  width = "w-64",
}: RAGFilterMenuProps) {
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(
    selectedFilters
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (categoryLabel: string, value: string) => {
    setLocalFilters((prev) => {
      const categoryFilters = prev[categoryLabel] || [];
      const isSelected = categoryFilters.includes(value);

      return {
        ...prev,
        [categoryLabel]: isSelected
          ? categoryFilters.filter((v) => v !== value)
          : [...categoryFilters, value],
      };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const cleared: Record<string, string[]> = {};
    categories.forEach((cat) => {
      cleared[cat.label] = [];
    });
    setLocalFilters(cleared);
    onClear();
    setIsOpen(false);
  };

  // Update local filters when selectedFilters prop changes
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const hasActiveFilters = Object.values(selectedFilters).some(
    (filters) => filters.length > 0
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={4}
        className={cn("px-0 py-2 border-0", width)}
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px",
        }}
      >
        <div className="space-y-4 px-4 pb-4 pt-2">
          {categories.map((category, categoryIndex) => (
            <div key={category.label}>
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                {category.label}
              </Label>
              <div className="space-y-0 gap-1">
                {category.options.map((option) => {
                  const isChecked =
                    (localFilters[category.label] || []).includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleToggle(category.label, option.value)}
                      className="flex items-center space-x-2 cursor-pointer rounded-sm px-2 py-1 -mx-2 hover:bg-secondary group"
                    >
                      <Checkbox
                        id={`${category.label}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={() =>
                          handleToggle(category.label, option.value)
                        }
                        className="h-4 w-4 cursor-pointer"
                      />
                      <Label
                        htmlFor={`${category.label}-${option.value}`}
                        className="text-sm text-muted-foreground group-hover:text-foreground cursor-pointer font-normal flex-1"
                      >
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {categoryIndex < categories.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-2 pb-0 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 text-muted-foreground hover:text-foreground hover:bg-transparent"
            disabled={!hasActiveFilters}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="shadow-buttons border-none h-7"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


