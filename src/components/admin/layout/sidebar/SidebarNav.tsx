"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { SidebarItem } from "./types";

type SidebarNavSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function SidebarNavSection({ title, isOpen, onToggle, children }: SidebarNavSectionProps) {
  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={onToggle}
      className="w-full"
    >
      <CollapsibleTrigger className="w-full px-2 py-2 flex items-center hover:bg-transparent group">
        <div className="text-xs font-normal text-muted-foreground tracking-wider">
          {title}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

type SidebarNavItemProps = {
  item: SidebarItem;
  isActive: boolean;
  onNavigate: (href: string) => void;
};

export function SidebarNavItem({ item, isActive, onNavigate }: SidebarNavItemProps) {
  return (
    <Link
      href={item.href}
      onClick={() => onNavigate(item.href)}
      className={cn(
        "group flex items-center gap-4 rounded-sm px-4 py-2 text-[16px] font-medium",
        "relative overflow-hidden",
        "active:scale-[0.98]",
        isActive
          ? "bg-primary/10 text-sidebar-foreground shadow-sm"
          : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-primary/10"
      )}
    >
      <FontAwesomeIcon 
        icon={item.icon} 
        className={cn(
          "h-4 w-4 transition-colors shrink-0",
          isActive ? "text-primary" : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
        )} 
      />
      <span className="relative">{item.title}</span>
    </Link>
  );
}

