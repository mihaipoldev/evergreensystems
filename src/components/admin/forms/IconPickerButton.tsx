"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPickerModal } from "@/components/admin/modals/IconPickerModal";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { faImage as faPlaceholderIcon, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";

type IconPickerButtonProps = {
  value?: string;
  onChange: (value: string) => void;
};

export function IconPickerButton({ value, onChange }: IconPickerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIconSelect = (iconClass: string) => {
    onChange(iconClass);
    setIsModalOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const hasIcon = !!value;

  return (
    <>
      <div className="relative w-full">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className={cn(
            "w-full h-10 border-input bg-input-background hover:bg-accent hover:border-primary/50 transition-all duration-200 relative overflow-hidden group",
            hasIcon && "border-primary/20 bg-primary/5"
          )}
        >
          <div className="flex items-center justify-center w-full h-full">
            {value ? (
              <div className="relative">
                <IconFromClass
                  iconClass={value}
                  fallbackIcon={faPlaceholderIcon}
                  className="h-5 w-5 text-primary transition-transform duration-200 group-hover:scale-110"
                />
                {hasIcon && (
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <IconFromClass
                  iconClass={null}
                  fallbackIcon={faPlaceholderIcon}
                  className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200"
                />
                <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors duration-200">
                  Select
                </span>
              </div>
            )}
          </div>
        </Button>
        
        {hasIcon && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-background/80 hover:bg-destructive/10 hover:text-destructive border border-border/50 shadow-sm opacity-70 hover:opacity-100 transition-opacity"
            title="Clear icon"
          >
            <FontAwesomeIcon icon={faX} className="h-2.5 w-2.5" />
          </Button>
        )}
      </div>

      <IconPickerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelect={handleIconSelect}
        selectedIconClass={value}
      />
    </>
  );
}
