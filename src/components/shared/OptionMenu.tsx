"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface OptionMenuOption {
  value: string;
  label: string;
}

interface OptionMenuProps {
  trigger: ReactNode;
  options: OptionMenuOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  width?: string;
}

export function OptionMenu({
  trigger,
  options,
  selectedValue,
  onSelect,
  width = "w-48",
}: OptionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        sideOffset={4}
        className={cn("px-0 py-2 border-0", width)}
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px'
        }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "cursor-pointer rounded-none px-4 py-2",
              selectedValue === option.value 
                ? "bg-accent/60 hover:bg-accent/100" 
                : "hover:bg-accent/100 focus:bg-accent/100"
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

