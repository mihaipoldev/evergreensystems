"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";

const navigationItems = [
  {
    title: "Dashboard",
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
    title: "Media Library",
    href: "/admin/media",
    icon: faImages,
  },
  {
    title: "Site Preferences",
    href: "/admin/site-preferences",
    icon: faCog,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: faGear,
  },
];

export function AdminSidebarMobile() {
  const pathname = usePathname();
  const { startNavigation, pendingPath } = useNavigationLoading();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-6 py-6">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faLeaf}
              className="h-6 w-6 text-primary"
            />
            <div className="flex flex-col">
              <SheetTitle className="text-base font-bold leading-tight">
                EVERGREEN LABS
              </SheetTitle>
              <p className="text-xs text-muted-foreground leading-tight">
                Admin Panel
              </p>
            </div>
          </div>
        </SheetHeader>
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            // Prioritize pendingPath over pathname for instant feedback
            // If there's a pending navigation, only that item should be active
            const isActive = pendingPath 
              ? (item.href === "/admin" 
                  ? pendingPath === item.href 
                  : pendingPath.startsWith(item.href + "/") || pendingPath === item.href)
              : (item.href === "/admin" 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href + "/") || pathname === item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  startNavigation(item.href);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  "active:scale-95 active:bg-sidebar-accent/80",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
