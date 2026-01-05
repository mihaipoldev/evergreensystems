"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RAGSortMenuProps {
  trigger: ReactNode;
  options: {
    value: string;
    label: string;
  }[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  width?: string;
}

export function RAGSortMenu({
  trigger,
  options,
  selectedValue,
  onSelect,
  width = "w-48",
}: RAGSortMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(selectedValue || "");

  // Update local value when selectedValue prop changes
  useEffect(() => {
    setLocalValue(selectedValue || "");
  }, [selectedValue]);

  const handleSelect = (value: string) => {
    setLocalValue(value);
    onSelect(value);
    setIsOpen(false);
  };

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
        <div className="px-4 py-2">
          <Label className="text-sm font-semibold text-foreground mb-3 block">
            Sort by
          </Label>
          <RadioGroup value={localValue} onValueChange={handleSelect} className="gap-1 flex flex-col space-y-0">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="flex items-center space-x-2 cursor-pointer rounded-sm px-2 py-1 -mx-2 hover:bg-accent/30 group"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`sort-${option.value}`}
                  className="cursor-pointer"
                />
                <Label
                  htmlFor={`sort-${option.value}`}
                  className="text-sm text-muted-foreground group-hover:text-foreground cursor-pointer font-normal flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}
