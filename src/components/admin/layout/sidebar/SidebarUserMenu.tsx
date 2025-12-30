"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCog,
  faSignOutAlt,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { getUserInitials } from "./utils/sidebar-helpers";
import type { SidebarUser } from "./types";

type SidebarUserMenuProps = {
  user: SidebarUser;
};

export function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mt-auto p-3 border-t border-border/50 bg-sidebar/95 backdrop-blur-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-sidebar-accent/60 transition-all duration-200 group">
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
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FontAwesomeIcon icon={faCog} className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

