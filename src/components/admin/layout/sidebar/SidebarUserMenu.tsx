"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPalette,
  faSignOutAlt,
  faEllipsisVertical,
  faSun,
  faMoon,
  faDisplay,
  faArrowRightArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { getUserInitials } from "./utils/sidebar-helpers";
import { cn } from "@/lib/utils";
import type { SidebarUser } from "./types";

const DROPDOWN_SHADOW =
  "rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px";

const itemClass = "cursor-pointer !rounded-none px-4 py-2";

type SidebarUserMenuProps = {
  user: SidebarUser;
};

export function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isIntelRoute = pathname?.startsWith("/intel") ?? false;
  const settingsBase = isIntelRoute ? "/intel/settings" : "/admin/settings";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative z-10 flex-shrink-0 mt-auto p-3 border-t border-border/50 bg-sidebar/95 backdrop-blur-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-sidebar-accent/60 transition-all duration-200 group cursor-pointer">
            <Avatar className="h-9 w-9 rounded-lg ring-2 ring-border/50 group-hover:ring-primary/30 transition-all">
              <AvatarImage src="" alt={user.name || user.email || "User"} />
              <AvatarFallback className="text-xs rounded-lg bg-primary/10 text-primary font-semibold">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {user.email}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-sidebar-foreground transition-colors"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={0}
          className="w-56 z-[65] px-0 py-2 border-0"
          style={{ boxShadow: DROPDOWN_SHADOW }}
        >
          <DropdownMenuItem asChild>
            <Link
              href={`${settingsBase}?tab=account`}
              className={cn(itemClass, "flex items-center")}
            >
              <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
              Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`${settingsBase}?tab=appearance-v2`}
              className={cn(itemClass, "flex items-center")}
            >
              <FontAwesomeIcon icon={faPalette} className="mr-2 h-4 w-4" />
              Appearance
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className={cn(itemClass, theme === "light" && "!text-primary")}
          >
            <FontAwesomeIcon icon={faSun} className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className={cn(itemClass, theme === "dark" && "!text-primary")}
          >
            <FontAwesomeIcon icon={faMoon} className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className={cn(itemClass, theme === "system" && "!text-primary")}
          >
            <FontAwesomeIcon icon={faDisplay} className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={isIntelRoute ? "/admin" : "/intel"}
              className={cn(itemClass, "flex items-center")}
            >
              <FontAwesomeIcon icon={faArrowRightArrowLeft} className="mr-2 h-4 w-4" />
              {isIntelRoute ? "Admin" : "Intelligence"}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className={cn(itemClass, "text-destructive focus:text-destructive")}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

