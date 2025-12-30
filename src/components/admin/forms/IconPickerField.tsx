"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { InputShadow } from "./InputShadow";
import { Button } from "@/components/ui/button";
import { IconPickerModal } from "@/components/admin/modals/IconPickerModal";
import { IconFromClass } from "@/components/admin/modals/IconFromClass";
import { faImage as faPlaceholderIcon } from "@fortawesome/free-solid-svg-icons";

type IconPickerFieldProps = Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
};

export const IconPickerField = React.forwardRef<HTMLInputElement, IconPickerFieldProps>(
  ({ value, onChange, placeholder = "Icon name or click to browse", error, className, ...props }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleIconSelect = (iconClass: string) => {
      onChange(iconClass);
    };

    return (
      <div className="relative">
        <div className="flex gap-2">
          {/* Icon Preview Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "flex-shrink-0 h-10 w-12 px-0 border-input bg-input-background hover:bg-accent",
              error && "border-destructive"
            )}
          >
            {value ? (
              <IconFromClass
                iconClass={value}
                fallbackIcon={faPlaceholderIcon}
                className="h-5 w-5"
              />
            ) : (
              <IconFromClass
                iconClass={null}
                fallbackIcon={faPlaceholderIcon}
                className="h-5 w-5 text-muted-foreground"
              />
            )}
          </Button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <InputShadow
              ref={ref}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn(error && "border-destructive", className)}
              {...props}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
        </div>

        {/* Icon Picker Modal */}
        <IconPickerModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSelect={handleIconSelect}
          selectedIconClass={value}
        />
      </div>
    );
  }
);

IconPickerField.displayName = "IconPickerField";
