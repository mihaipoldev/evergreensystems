"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InputShadow } from "@/components/admin/forms/InputShadow";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

type IconPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconClass: string) => void;
  selectedIconClass?: string;
};

/**
 * Converts camelCase to kebab-case
 * Example: faPenToSquare -> pen-to-square
 */
function camelToKebab(str: string): string {
  // Remove 'fa' prefix if present
  let result = str.startsWith('fa') ? str.substring(2) : str;
  
  // Convert camelCase to kebab-case
  // Insert dash before uppercase letters (but not at the start)
  result = result.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  
  return result;
}

/**
 * Converts icon key to display name
 * Example: faPenToSquare -> pen-to-square
 */
function iconKeyToDisplayName(key: string): string {
  return camelToKebab(key);
}

/**
 * Converts display name to icon class format
 * Example: pen-to-square -> fa-pen-to-square
 */
function displayNameToIconClass(displayName: string): string {
  return `fa-${displayName}`;
}

export function IconPickerModal({
  open,
  onOpenChange,
  onSelect,
  selectedIconClass,
}: IconPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Extract all Font Awesome icons
  const availableIcons = useMemo(() => {
    const iconList: Array<{
      key: string;
      icon: IconDefinition;
      displayName: string;
      iconClass: string;
    }> = [];

    // Get all keys from the Icons object
    Object.keys(Icons).forEach((key) => {
      const icon = Icons[key as keyof typeof Icons];
      
      // Check if it's an IconDefinition (has icon property)
      if (
        icon &&
        typeof icon === 'object' &&
        'icon' in icon &&
        key.startsWith('fa')
      ) {
        const displayName = iconKeyToDisplayName(key);
        const iconClass = displayNameToIconClass(displayName);
        
        iconList.push({
          key,
          icon: icon as IconDefinition,
          displayName,
          iconClass,
        });
      }
    });

    // Sort alphabetically by display name
    return iconList.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableIcons;
    }

    const query = searchQuery.toLowerCase().trim();
    return availableIcons.filter(
      (item) =>
        item.displayName.toLowerCase().includes(query) ||
        item.iconClass.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query)
    );
  }, [availableIcons, searchQuery]);

  const handleIconClick = (iconClass: string) => {
    onSelect(iconClass);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>
            Search and select a Font Awesome icon from the list below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 flex flex-col min-h-0">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
            />
            <InputShadow
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Icons Grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredIcons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery
                  ? "No icons found matching your search"
                  : "No icons available"}
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {filteredIcons.map((item) => {
                  const isSelected = selectedIconClass === item.iconClass;
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleIconClick(item.iconClass)}
                      className={cn(
                        "group flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all hover:bg-accent",
                        isSelected
                          ? "ring-2 ring-primary bg-accent"
                          : "hover:shadow-md"
                      )}
                      title={item.displayName}
                    >
                      {/* Icon Preview */}
                      <div className="w-8 h-8 flex items-center justify-center mb-2">
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="h-6 w-6 text-foreground"
                        />
                      </div>

                      {/* Icon Name */}
                      <div className="text-[10px] text-muted-foreground text-center truncate w-full px-1">
                        {item.displayName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {filteredIcons.length} {filteredIcons.length === 1 ? "icon" : "icons"}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
