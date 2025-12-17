"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCog,
  faLayerGroup,
  faImages,
  faGear,
  faFile,
  faHome,
  faEllipsisVertical,
  faUser,
  faSignOutAlt,
  faSitemap,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { ChevronDown } from "lucide-react";
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
import { useEffect, useState, useMemo } from "react";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";
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
import { createClient } from "@/lib/supabase/client";
import { CircleButton } from "@/components/admin/CircleButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePages } from "@/lib/react-query/hooks";
import { useSections } from "@/lib/react-query/hooks";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Page } from "@/features/pages/types";

const topLevelItems = [
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: faChartLine,
  },
  {
    title: "Site Structure",
    href: "/admin/site-structure",
    icon: faSitemap,
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
  {
    title: "Website Settings",
    href: "/admin/website-settings",
    icon: faGlobe,
  },
];

export function AdminSidebarMobile() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startNavigation, pendingPath } = useNavigationLoading();
  const [open, setOpen] = useState(false);
  const [openPages, setOpenPages] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<{
    email: string | null;
    name: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch pages
  const { data: pages = [], isLoading: pagesLoading } = usePages();

  // Determine which page should be open based on current route
  // Check query params first (new URL structure), then fall back to pathname (old structure)
  const currentPageId = useMemo(() => {
    // Check query params for pageId (new URL structure: /admin/sections/[id]?pageId=[pageId])
    const queryPageId = searchParams.get("pageId");
    if (queryPageId) {
      return queryPageId;
    }
    // Fall back to old URL structure: /admin/pages/[id]/...
    const match = pathname.match(/\/admin\/pages\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname, searchParams]);

  // Load persisted sidebar state from localStorage
  useEffect(() => {
    if (pages.length > 0 && !isInitialized) {
      try {
        const stored = localStorage.getItem("admin-sidebar-open-pages");
        if (stored) {
          const storedPageIds = JSON.parse(stored) as string[];
          const storedSet = new Set(storedPageIds.filter((id) => 
            pages.some((page) => page.id === id)
          ));
          setOpenPages(storedSet);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading sidebar state:", error);
        setIsInitialized(true);
      }
    }
  }, [pages, isInitialized]);

  // Auto-open page if we're on a page route (but don't persist this)
  useEffect(() => {
    if (isInitialized && currentPageId && !openPages.has(currentPageId)) {
      setOpenPages((prev) => {
        const next = new Set([...prev, currentPageId]);
        // Store updated state
        try {
          localStorage.setItem("admin-sidebar-open-pages", JSON.stringify(Array.from(next)));
        } catch (error) {
          console.error("Error saving sidebar state:", error);
        }
        return next;
      });
    }
  }, [currentPageId, openPages, isInitialized]);

  const togglePage = (pageId: string) => {
    setOpenPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      // Persist to localStorage
      try {
        localStorage.setItem("admin-sidebar-open-pages", JSON.stringify(Array.from(next)));
      } catch (error) {
        console.error("Error saving sidebar state:", error);
      }
      return next;
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser({
        email: authUser?.email || null,
        name:
          authUser?.user_metadata?.full_name ||
          authUser?.email?.split("@")[0] ||
          null,
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 p-0 border-r border-border/50 bg-sidebar shadow-lg backdrop-blur-sm"
      >
        <div className="flex flex-col h-full">
          <style jsx global>{`
            [data-radix-dialog-close] {
              display: none !important;
            }
          `}</style>
          <SheetHeader className="px-6 py-5 border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex flex-col flex-1 min-w-0">
                <SheetTitle className="text-lg font-bold leading-tight text-sidebar-foreground tracking-tight">
                  Evergreen Sys.
                </SheetTitle>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5 font-medium">
                  Admin Panel
                </p>
              </div>
              <Link href="/" onClick={() => setOpen(false)}>
                <CircleButton
                  size="md"
                  variant="ghost"
                  className="shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
                </CircleButton>
              </Link>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <nav className="px-3 py-4 space-y-0.5">
              {/* Analytics */}
              {topLevelItems
                .filter((item) => item.title === "Analytics")
                .map((item) => {
                const isActive = pendingPath
                  ? item.href === "/admin/analytics"
                    ? pendingPath === item.href ||
                      pendingPath.startsWith("/admin/analytics")
                    : pendingPath.startsWith(item.href + "/") ||
                      pendingPath === item.href
                  : item.href === "/admin/analytics"
                  ? pathname === item.href ||
                    pathname.startsWith("/admin/analytics")
                  : pathname.startsWith(item.href + "/") ||
                    pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      startNavigation(item.href);
                      setOpen(false);
                    }}
                    className={cn(
                      "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200",
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
                        isActive
                          ? "text-primary"
                          : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
                      )}
                    />
                    <span className="relative">{item.title}</span>
                  </Link>
                );
                })}

              {/* All pages - positioned between Analytics and Media Library */}
              {pagesLoading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Loading pages...</div>
              ) : (
                pages.map((page) => (
                  <PageCollapsibleMobile
                    key={page.id}
                    page={page}
                    isOpen={openPages.has(page.id)}
                    onToggle={() => togglePage(page.id)}
                    pathname={pathname}
                    pendingPath={pendingPath}
                    searchParams={searchParams}
                    startNavigation={(href) => {
                      startNavigation(href);
                      setOpen(false);
                    }}
                  />
                ))
              )}

              {/* Media Library and Settings */}
              {topLevelItems
                .filter((item) => item.title !== "Analytics")
                .map((item) => {
                  const isActive = pendingPath
                    ? item.href === "/admin/analytics"
                      ? pendingPath === item.href ||
                        pendingPath.startsWith("/admin/analytics")
                      : pendingPath.startsWith(item.href + "/") ||
                        pathname === item.href
                    : item.href === "/admin/analytics"
                    ? pathname === item.href ||
                      pathname.startsWith("/admin/analytics")
                    : pathname.startsWith(item.href + "/") ||
                      pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        startNavigation(item.href);
                        setOpen(false);
                      }}
                      className={cn(
                        "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200",
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
                          isActive
                            ? "text-primary"
                            : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
                        )}
                      />
                      <span className="relative">{item.title}</span>
                    </Link>
                  );
                })}
            </nav>
          </ScrollArea>

          {!loading && user && (
            <div className="mt-auto p-3 border-t border-border/50 bg-sidebar/95 backdrop-blur-sm">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-sidebar-accent/60 transition-all duration-200 group">
                    <Avatar className="h-9 w-9 rounded-lg ring-2 ring-border/50 group-hover:ring-primary/30 transition-all">
                      <AvatarImage
                        src=""
                        alt={user.name || user.email || "User"}
                      />
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
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      className="mr-2 h-4 w-4"
                    />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

type PageCollapsibleMobileProps = {
  page: Page;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  pendingPath: string | null;
  searchParams: URLSearchParams;
  startNavigation: (href: string) => void;
};

function PageCollapsibleMobile({
  page,
  isOpen,
  onToggle,
  pathname,
  pendingPath,
  searchParams,
  startNavigation,
}: PageCollapsibleMobileProps) {
  const { data: sections = [], isLoading: sectionsLoading } = useSections(
    { pageId: page.id },
    { enabled: true } // Always fetch to check active state for content item routes
  );

  // Fetch site structure info for this page
  const { data: siteStructureInfo = [] } = useQuery({
    queryKey: ["site-structure", page.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/site-structure?pageId=${page.id}`);
      if (!response.ok) {
        return [];
      }
      return response.json() as Promise<Array<{ page_type: string; environment: 'production' | 'development' | 'both' }>>;
    },
  });
  
  // Auto-open page if we're on a route that belongs to this page
  useEffect(() => {
    if (isOpen) return; // Already open, no need to check
    
    const currentPath = pendingPath || pathname;
    const queryPageId = searchParams.get("pageId");
    const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "cta"];
    
    // Check if we're on a content item edit route (e.g., /admin/testimonials/[id]/edit)
    const contentItemRouteMatch = currentPath.match(/\/admin\/(testimonials|faq|features|cta)\/[^/]+\/edit/);
    if (contentItemRouteMatch) {
      // Check if returnTo parameter points to a section on this page
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        // Parse page ID from returnTo URL (new or old structure)
        const newReturnToMatch = returnTo.match(/\/admin\/sections\/[^/?]+.*[?&]pageId=([^&]+)/);
        const oldReturnToMatch = returnTo.match(/\/admin\/pages\/([^/]+)\/sections\/[^/?]+/);
        const returnToPageId = newReturnToMatch?.[1] || oldReturnToMatch?.[1];
        if (returnToPageId === page.id) {
          onToggle();
          return;
        }
      }
      // If no returnTo, check if query param pageId matches this page
      if (queryPageId === page.id) {
        const contentType = contentItemRouteMatch[1];
        // Check if this page has a section of this content type
        const hasMatchingSection = sections.some((section) => (section as any).type === contentType);
        if (hasMatchingSection) {
          onToggle();
          return;
        }
      }
    }
    
    // Check section routes (new URL structure)
    const sectionMatch = currentPath.match(/\/admin\/sections\/([^/]+)/);
    if (sectionMatch) {
      const sectionId = sectionMatch[1];
      // Only auto-open if the pageId query param matches this page
      if (queryPageId === page.id) {
        const hasMatchingSection = sections.some((section) => section.id === sectionId);
        if (hasMatchingSection) {
          onToggle();
          return;
        }
      }
    }
  }, [pathname, pendingPath, sections, isOpen, onToggle, page.id, searchParams]);

  // Check if we're on this page or any of its sections
  const currentPath = pendingPath || pathname;
  const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "cta"];
  
  // Check if we're on a content item edit route (e.g., /admin/testimonials/[id]/edit)
  const contentItemRouteMatch = currentPath.match(/\/admin\/(testimonials|faq|features|cta)\/[^/]+\/edit/);
  let isPageActive = false;
  if (contentItemRouteMatch) {
    // Check if returnTo parameter points to a section on this page
    const returnTo = searchParams.get('returnTo');
    if (returnTo) {
      // Parse page ID and section ID from returnTo URL (new or old structure)
      // New structure: /admin/sections/[sectionId]?pageId=[pageId]&tab=...
      const newReturnToMatch = returnTo.match(/\/admin\/sections\/([^/?]+).*[?&]pageId=([^&]+)/);
      // Old structure: /admin/pages/[pageId]/sections/[sectionId]?tab=...
      const oldReturnToMatch = returnTo.match(/\/admin\/pages\/([^/]+)\/sections\/([^/?]+)/);
      const returnToPageId = newReturnToMatch?.[2] || oldReturnToMatch?.[1];
      const returnToSectionId = newReturnToMatch?.[1] || oldReturnToMatch?.[2];
      if (returnToPageId === page.id && returnToSectionId) {
        isPageActive = sections.some((section) => section.id === returnToSectionId);
      }
    } else {
      // Only check if query param pageId matches this page
      if (searchParams.get("pageId") === page.id) {
        const contentType = contentItemRouteMatch[1];
        isPageActive = sections.some((section) => (section as any).type === contentType);
      }
    }
  } else {
    // Check if we're on a section route with this page's pageId in query params
    const isNewSectionRoute = currentPath.startsWith("/admin/sections/");
    const queryPageId = searchParams.get("pageId");
    const isSectionOnThisPage = isNewSectionRoute && queryPageId === page.id;
    
    isPageActive =
      currentPath === `/admin/pages/${page.id}/sections` ||
      currentPath.startsWith(`/admin/pages/${page.id}/`) ||
      isSectionOnThisPage ||
      sections.some((section) => {
        const sectionType = (section as any).type;
        const isContentSection = CONTENT_SECTION_TYPES.includes(sectionType);
        const isHeroSection = sectionType === "hero";
        
        // Check new URL structure: /admin/sections/[sectionId]?pageId=[pageId]
        const newSectionPath = `/admin/sections/${section.id}`;
        const isNewSectionPath = currentPath.startsWith(newSectionPath);
        const isSectionWithThisPage = isNewSectionPath && queryPageId === page.id;
        
        // Check old URL structure: /admin/pages/[pageId]/sections/[sectionId]/...
        const oldSectionPath = `/admin/pages/${page.id}/sections/${section.id}`;
        
        if (isContentSection) {
          // For content sections, check new routes and old routes (only if pageId matches)
          return (
            isSectionWithThisPage ||
            currentPath.startsWith(`${oldSectionPath}/items`) ||
            currentPath === `${oldSectionPath}/edit`
          );
        } else if (isHeroSection) {
          // For hero sections, check new routes and old routes (only if pageId matches)
          return (
            isSectionWithThisPage ||
            currentPath === `${oldSectionPath}/media` ||
            currentPath === `${oldSectionPath}/cta` ||
            currentPath === `${oldSectionPath}/edit`
          );
        } else {
          // For other non-content sections, check new routes and old routes (only if pageId matches)
          return (
            isSectionWithThisPage ||
            currentPath === `${oldSectionPath}/edit`
          );
        }
      });
  }

  const viewAllSectionsHref = `/admin/pages/${page.id}/sections`;
  const isViewAllActive = 
    currentPath === `/admin/pages/${page.id}/sections` ||
    currentPath === `/admin/pages/${page.id}/edit`;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger
        className={cn(
          "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full",
          "relative overflow-hidden",
          "active:scale-[0.98]",
          isPageActive
            ? "bg-primary/10 text-sidebar-foreground shadow-sm"
            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-primary/10"
        )}
      >
        <FontAwesomeIcon
          icon={faFile}
          className={cn(
            "h-4 w-4 transition-colors shrink-0",
            isPageActive
              ? "text-primary"
              : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
          )}
        />
        <span className="relative flex-1 text-left truncate">{page.title}</span>
        {siteStructureInfo.length > 0 && (
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {siteStructureInfo.map((info) => {
              if (info.environment === 'both') {
                return (
                  <div key={info.page_type} className="flex items-center gap-0.5">
                    <Badge variant="destructive" className="text-[10px] font-semibold px-1 py-0 h-4">
                      Prod
                    </Badge>
                    <Badge className="text-[10px] font-semibold px-1 py-0 h-4 bg-primary text-primary-foreground border-transparent">
                      Dev
                    </Badge>
                  </div>
                );
              } else if (info.environment === 'production') {
                return (
                  <Badge key={info.page_type} variant="destructive" className="text-[10px] font-semibold px-1 py-0 h-4">
                    Prod
                  </Badge>
                );
              } else {
                return (
                  <Badge key={info.page_type} className="text-[10px] font-semibold px-1 py-0 h-4 bg-primary text-primary-foreground border-transparent">
                    Dev
                  </Badge>
                );
              }
            })}
          </div>
        )}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform shrink-0",
            isOpen && "rotate-180",
            isPageActive ? "text-primary" : "text-sidebar-foreground/70"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 pr-4 space-y-0.5 mt-0.5">
        {/* Page Settings link */}
        <Link
          href={viewAllSectionsHref}
          onClick={() => startNavigation(viewAllSectionsHref)}
          className={cn(
            "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-all duration-200",
            "relative overflow-hidden",
            "active:scale-[0.98]",
            isViewAllActive
              ? "bg-primary/10 text-sidebar-foreground shadow-sm"
              : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-primary/10"
          )}
        >
          <FontAwesomeIcon
            icon={faLayerGroup}
            className={cn(
              "h-3.5 w-3.5 transition-colors shrink-0",
              isViewAllActive
                ? "text-primary"
                : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
            )}
          />
          <span className="relative">Page Settings</span>
        </Link>

        {/* Individual section links */}
        {sectionsLoading ? (
          <div className="px-3 py-1.5 text-xs text-muted-foreground">Loading sections...</div>
        ) : (
          sections
            .sort((a, b) => {
              const aPos = (a as any).position ?? 0;
              const bPos = (b as any).position ?? 0;
              return aPos - bPos;
            })
            .map((section) => {
              const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "cta", "timeline", "results"];
              const isContentSection = CONTENT_SECTION_TYPES.includes((section as any).type);
              const isHeroSection = (section as any).type === "hero";
              const isHeaderSection = (section as any).type === "header";
              const isCTASection = (section as any).type === "cta";
              
              // Determine section href based on type (using new URL structure)
              const sectionBase = `/admin/sections/${section.id}`;
              let sectionHref: string;
              if (isHeroSection) {
                sectionHref = `${sectionBase}?pageId=${page.id}&tab=media`;
              } else if (isHeaderSection) {
                sectionHref = `${sectionBase}?pageId=${page.id}&tab=cta`;
              } else if (isContentSection) {
                // Use section-type-specific tab name
                const sectionType = (section as any).type;
                if (sectionType === "faq") {
                  sectionHref = `${sectionBase}?pageId=${page.id}&tab=faq`;
                } else if (sectionType === "testimonials") {
                  sectionHref = `${sectionBase}?pageId=${page.id}&tab=testimonials`;
                } else if (sectionType === "features") {
                  sectionHref = `${sectionBase}?pageId=${page.id}&tab=features`;
                } else if (sectionType === "timeline") {
                  sectionHref = `${sectionBase}?pageId=${page.id}&tab=timeline`;
                } else if (sectionType === "results") {
                  sectionHref = `${sectionBase}?pageId=${page.id}&tab=results`;
                } else if (sectionType === "cta") {
                  sectionHref = `${sectionBase}?pageId=${page.id}&tab=cta`;
                } else {
                  sectionHref = `${sectionBase}?pageId=${page.id}&tab=edit`;
                }
              } else {
                sectionHref = `${sectionBase}?pageId=${page.id}&tab=edit`;
              }
              
              const currentPath = pendingPath || pathname;
              
              // Check if we're on a section route (new URL structure or old routes for backward compatibility)
              let isSectionActive = false;
              
              // Check new URL structure: /admin/sections/[sectionId]?pageId=[pageId]
              const newSectionPath = `/admin/sections/${section.id}`;
              if (currentPath.startsWith(newSectionPath)) {
                const queryPageId = searchParams.get("pageId");
                // Only mark as active if pageId matches this page
                if (queryPageId === page.id) {
                  isSectionActive = true;
                }
              }
              
              // Check old route structure for backward compatibility: /admin/pages/[pageId]/sections/[sectionId]
              if (!isSectionActive) {
                const oldSectionBase = `/admin/pages/${page.id}/sections/${section.id}`;
                if (currentPath.startsWith(oldSectionBase)) {
                  isSectionActive = true;
                }
              }
              
              // Check content item edit routes (old routes only - no /items/ routes)
              if (!isSectionActive && isContentSection) {
                const sectionType = (section as any).type;
                const oldContentItemRoutePattern = new RegExp(`^/admin/${sectionType}/[^/]+/edit$`);
                
                // Check if we're on a content item edit route
                if (oldContentItemRoutePattern.test(currentPath)) {
                  // Check if returnTo parameter points to this section AND this page
                  const returnTo = searchParams.get('returnTo');
                  if (returnTo) {
                    // Parse section ID and page ID from returnTo URL (new or old structure)
                    // New structure: /admin/sections/[sectionId]?pageId=[pageId]&tab=...
                    const newReturnToMatch = returnTo.match(/\/admin\/sections\/([^/?]+).*[?&]pageId=([^&]+)/);
                    // Old structure: /admin/pages/[pageId]/sections/[sectionId]?tab=...
                    const oldReturnToMatch = returnTo.match(/\/admin\/pages\/([^/]+)\/sections\/([^/?]+)/);
                    
                    const returnToPageId = newReturnToMatch?.[2] || oldReturnToMatch?.[1];
                    const returnToSectionId = newReturnToMatch?.[1] || oldReturnToMatch?.[2];
                    
                    if (returnToPageId === page.id && returnToSectionId === section.id) {
                      isSectionActive = true;
                    }
                  } else {
                    // If no returnTo, check if query param pageId matches this page
                    const queryPageId = searchParams.get("pageId");
                    if (queryPageId === page.id) {
                      isSectionActive = true;
                    }
                  }
                }
              }
              
              const isSectionPublished = (section as any).status === 'published';

              return (
                <Link
                  key={section.id}
                  href={sectionHref}
                  onClick={() => startNavigation(sectionHref)}
                  className={cn(
                    "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-all duration-200",
                    "relative overflow-hidden",
                    "active:scale-[0.98]",
                    isSectionActive
                      ? "bg-primary/10 text-sidebar-foreground shadow-sm"
                      : isSectionPublished
                      ? "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-primary/10"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground/70 hover:bg-primary/5"
                  )}
                >
                  <FontAwesomeIconFromClass
                    iconClass={(section as any).icon || null}
                    fallbackIcon={faLayerGroup}
                    className={cn(
                      "h-3.5 w-3.5 transition-colors shrink-0",
                      isSectionActive
                        ? "text-primary"
                        : isSectionPublished
                        ? "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                        : "text-sidebar-foreground/40"
                    )}
                  />
                  <span className="relative flex-1 truncate">
                    {section.admin_title || section.title || section.type}
                  </span>
                </Link>
              );
            })
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
