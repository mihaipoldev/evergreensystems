"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageSectionStatus = "published" | "draft" | "deactivated";

type PageSectionStatusSelectorProps = {
  status: PageSectionStatus | null | undefined;
  onStatusChange: (newStatus: PageSectionStatus) => void;
  disabled?: boolean;
};

const statusConfig = {
  published: {
    label: "Published",
    color: "!text-green-700 dark:!text-green-400",
    bgColor: "!bg-green-100 dark:!bg-green-900/30",
    description: "Visible in production",
  },
  draft: {
    label: "Draft",
    color: "!text-yellow-700 dark:!text-yellow-400",
    bgColor: "!bg-yellow-100 dark:!bg-yellow-900/30",
    description: "Visible in development only",
  },
  deactivated: {
    label: "Deactivated",
    color: "!text-gray-700 dark:!text-gray-400",
    bgColor: "!bg-gray-100 dark:!bg-gray-700/30",
    description: "Hidden everywhere",
  },
};

export function PageSectionStatusSelector({
  status,
  onStatusChange,
  disabled = false,
}: PageSectionStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Ensure status is valid, default to "draft" if invalid or undefined
  const validStatus: PageSectionStatus = status && status in statusConfig 
    ? status 
    : "draft";
  const currentConfig = statusConfig[validStatus];

  const statuses: PageSectionStatus[] = ["published", "draft", "deactivated"];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 gap-2 px-3 text-xs font-medium transition-colors rounded-md",
            currentConfig.bgColor,
            currentConfig.color,
            "hover:opacity-80"
          )}
        >
          {currentConfig.label}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={cn(
              "h-3 w-3 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {statuses.map((statusOption) => {
          const config = statusConfig[statusOption];
          const isSelected = validStatus === statusOption;

          return (
            <DropdownMenuItem
              key={statusOption}
              onClick={() => {
                if (statusOption !== validStatus) {
                  onStatusChange(statusOption);
                }
                setIsOpen(false);
              }}
              className={cn(
                "flex items-start gap-3 cursor-pointer",
                isSelected && "bg-muted"
              )}
            >
              <div className="flex h-5 items-center">
                {isSelected ? (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={cn("h-4 w-4", config.color)}
                  />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-sm font-medium", config.color)}>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

