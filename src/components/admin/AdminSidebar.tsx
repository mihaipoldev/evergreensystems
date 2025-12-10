"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCog,
  faLayerGroup,
  faStar,
  faQuoteLeft,
  faQuestionCircle,
  faImages,
  faGear,
  faLeaf,
  faUser,
  faSignOutAlt,
  faEllipsisVertical,
  faFile,
  faHome,
  faMousePointer,
} from "@fortawesome/free-solid-svg-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { CircleButton } from "@/components/admin/CircleButton";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";

const navigationItems = [
  {
    title: "Analytics",
    href: "/admin",
    icon: faChartLine,
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: faFile,
  },
  {
    title: "Sections",
    href: "/admin/sections",
    icon: faLayerGroup,
  },
  {
    title: "Features",
    href: "/admin/features",
    icon: faStar,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: faQuoteLeft,
  },
  {
    title: "FAQ",
    href: "/admin/faq",
    icon: faQuestionCircle,
  },
  {
    title: "CTA",
    href: "/admin/cta",
    icon: faMousePointer,
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: faImages,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: faGear,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation, pendingPath } = useNavigationLoading();
  const [user, setUser] = useState<{
    email: string | null;
    name: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser({
        email: authUser?.email || null,
        name: authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || null,
      });
      setLoading(false);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getUserInitials = () => {
    if (!user?.name && !user?.email) return "U";
    const name = user.name || user.email || "";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || "U";
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 border-r border-border/50 bg-sidebar shadow-lg backdrop-blur-sm">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="font-bold text-sidebar-foreground tracking-tight text-lg leading-tight">
              Evergreen Sys.
            </h2>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5 font-medium">
              Admin Panel
            </p>
          </div>
          <Link href="/">
            <CircleButton 
              size="md" 
              variant="ghost" 
              className="shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
            </CircleButton>
          </Link>
        </div>

        {/* Navigation Section */}
        <ScrollArea className="flex-1">
          <nav className="px-3 py-4 space-y-0.5">
            {navigationItems.map((item) => {
              // Prioritize pendingPath over pathname for instant feedback
              // If there's a pending navigation, only that item should be active
              const isActive = pendingPath 
                ? (item.href === "/admin" 
                    ? pendingPath === item.href || pendingPath.startsWith("/admin/analytics")
                    : pendingPath.startsWith(item.href + "/") || pendingPath === item.href)
                : (item.href === "/admin" 
                    ? pathname === item.href || pathname.startsWith("/admin/analytics")
                    : pathname.startsWith(item.href + "/") || pathname === item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => startNavigation(item.href)}
                  className={cn(
                    "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    "relative overflow-hidden",
                    "active:scale-[0.98]",
                    isActive
                      ? "bg-primary/10 text-sidebar-foreground shadow-sm"
                      : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-primary/10"
                  )}
                >
                  {/* Active indicator bar */}
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
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        {!loading && user && (
          <div className="mt-auto p-3 border-t border-border/50 bg-sidebar/95 backdrop-blur-sm">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-sidebar-accent/60 transition-all duration-200 group">
                  <Avatar className="h-9 w-9 rounded-lg ring-2 ring-border/50 group-hover:ring-primary/30 transition-all">
                    <AvatarImage src="" alt={user.name || user.email || "User"} />
                    <AvatarFallback className="text-xs rounded-lg bg-primary/10 text-primary font-semibold">
                      {getUserInitials()}
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
        )}
      </div>
    </aside>
  );
}
