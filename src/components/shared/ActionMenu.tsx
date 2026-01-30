"use client";

import { ReactNode } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markClickFromDropdown } from "@/features/rag/shared/utils/dropdownClickGuard";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label?: string;
  icon?: ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  href?: string;
  destructive?: boolean;
  separator?: boolean;
  disabled?: boolean;
  active?: boolean;
}

interface ActionMenuProps {
  trigger: ReactNode;
  items: ActionMenuItem[];
  align?: "start" | "center" | "end";
  width?: string;
}

export function ActionMenu({
  trigger,
  items,
  align = "end",
  width = "w-48",
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align}
        sideOffset={0}
        className={cn("px-0 py-2 border-0", width)}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDown={() => markClickFromDropdown()}
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px'
        }}
      >
        {items.map((item, index) => {
          if (item.separator) {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const content = (
            <>
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </>
          );

          const className = cn(
            "cursor-pointer !rounded-none px-4 py-2",
            item.active && "!text-primary !bg-primary/10 hover:!text-primary hover:!bg-primary/20 focus:!text-primary focus:!bg-primary/20",
            item.destructive && "text-destructive focus:text-destructive",
            item.disabled && "opacity-50 cursor-not-allowed"
          );

          if (item.href && !item.disabled) {
            return (
              <DropdownMenuItem key={index} asChild>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick?.(e);
                  }}
                  className={className}
                >
                  {content}
                </Link>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) {
                  item.onClick?.(e);
                }
              }}
              disabled={item.disabled}
              className={className}
            >
              {content}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

