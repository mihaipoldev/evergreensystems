"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

type SidebarHeaderProps = {
  isMobile?: boolean;
  onHomeClick?: () => void;
};

export function SidebarHeader({ isMobile = false, onHomeClick }: SidebarHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
      <div className="flex flex-col flex-1 min-w-0">
        <h2 className="font-bold text-sidebar-foreground tracking-tight text-lg leading-tight">
          Evergreen Sys.
        </h2>
        <p className="text-xs text-muted-foreground leading-tight mt-0.5 font-medium">
          Admin Panel
        </p>
      </div>
      <Link href="/" onClick={onHomeClick}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

