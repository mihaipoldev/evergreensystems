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
  faUser,
  faSignOutAlt,
  faEllipsisVertical,
  faFile,
  faHome,
  faShareAlt,
  faLaptopCode,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import { ChevronDown } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { CircleButton } from "@/components/admin/CircleButton";
import { useNavigationLoading } from "@/providers/NavigationLoadingProvider";
import { usePages } from "@/lib/react-query/hooks";
import { useSections } from "@/lib/react-query/hooks";
import { FontAwesomeIconFromClass } from "@/components/admin/FontAwesomeIconFromClass";
import type { Page } from "@/features/pages/types";
import type { Section } from "@/features/sections/types";

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
    title: "Social Platforms",
    href: "/admin/social-platforms",
    icon: faShareAlt,
  },
  {
    title: "Softwares",
    href: "/admin/softwares",
    icon: faLaptopCode,
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
  const searchParams = useSearchParams();
  const { startNavigation, pendingPath } = useNavigationLoading();
  const [user, setUser] = useState<{
    email: string | null;
    name: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openPages, setOpenPages] = useState<Set<string>>(new Set());

  // Fetch pages
  const { data: pages = [], isLoading: pagesLoading } = usePages();

  // Determine which page should be open based on current route
  const currentPageId = useMemo(() => {
    const match = pathname.match(/\/admin\/pages\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  // Expand all pages by default when pages are loaded
  useEffect(() => {
    if (pages.length > 0) {
      // Set all pages to be open by default
      const allPageIds = new Set(pages.map((page) => page.id));
      setOpenPages(allPageIds);
    }
  }, [pages]);

  // Auto-open page if we're on a page route (fallback, but all should already be open)
  useEffect(() => {
    if (currentPageId && !openPages.has(currentPageId)) {
      setOpenPages((prev) => new Set([...prev, currentPageId]));
    }
  }, [currentPageId, openPages]);

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

  const togglePage = (pageId: string) => {
    setOpenPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
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
            {/* Analytics */}
            {topLevelItems
              .filter((item) => item.title === "Analytics")
              .map((item) => {
                const isActive = pendingPath 
                  ? (item.href === "/admin/analytics" 
                      ? pendingPath === item.href || pendingPath.startsWith("/admin/analytics")
                      : pendingPath.startsWith(item.href + "/") || pendingPath === item.href)
                  : (item.href === "/admin/analytics" 
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

            {/* Site Structure */}
            {topLevelItems
              .filter((item) => item.title === "Site Structure")
              .map((item) => {
                const isActive = pendingPath 
                  ? pendingPath === item.href || pendingPath.startsWith(item.href + "/")
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                
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

            {/* All pages - positioned between Site Structure and Media Library */}
            {pagesLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading pages...</div>
            ) : (
              pages.map((page) => (
                <PageCollapsible
                  key={page.id}
                  page={page}
                  isOpen={openPages.has(page.id)}
                  onToggle={() => togglePage(page.id)}
                  pathname={pathname}
                  pendingPath={pendingPath}
                  searchParams={searchParams}
                  startNavigation={startNavigation}
                />
              ))
            )}

            {/* Media Library and Settings */}
            {topLevelItems
              .filter((item) => item.title !== "Analytics" && item.title !== "Site Structure")
              .map((item) => {
                const isActive = pendingPath 
                  ? (item.href === "/admin/analytics" 
                      ? pendingPath === item.href || pendingPath.startsWith("/admin/analytics")
                      : pendingPath.startsWith(item.href + "/") || pendingPath === item.href)
                  : (item.href === "/admin/analytics" 
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

type PageCollapsibleProps = {
  page: Page;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  pendingPath: string | null;
  searchParams: URLSearchParams;
  startNavigation: (href: string) => void;
};

function PageCollapsible({
  page,
  isOpen,
  onToggle,
  pathname,
  pendingPath,
  searchParams,
  startNavigation,
}: PageCollapsibleProps) {
  const { data: sections = [], isLoading: sectionsLoading } = useSections(
    { pageId: page.id },
    { enabled: true } // Always fetch to check active state for content item routes
  );
  
  // Auto-open page if we're on a route that belongs to this page
  useEffect(() => {
    if (isOpen) return; // Already open, no need to check
    
    const currentPath = pendingPath || pathname;
    const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "cta"];
    
    // Check if we're on a content item edit route (e.g., /admin/testimonials/[id]/edit)
    const contentItemRouteMatch = currentPath.match(/\/admin\/(testimonials|faq|features|cta)\/[^/]+\/edit/);
    if (contentItemRouteMatch) {
      const contentType = contentItemRouteMatch[1];
      // Check if this page has a section of this content type
      const hasMatchingSection = sections.some((section) => (section as any).type === contentType);
      if (hasMatchingSection) {
        onToggle();
        return;
      }
    }
    
    // Check section routes
    const sectionMatch = currentPath.match(/\/admin\/sections\/([^/]+)/);
    if (sectionMatch) {
      const sectionId = sectionMatch[1];
      const hasMatchingSection = sections.some((section) => section.id === sectionId);
      if (hasMatchingSection) {
        onToggle();
        return;
      }
    }
  }, [pathname, pendingPath, sections, isOpen, onToggle]);

  // Check if we're on this page or any of its sections
  const isPageActive = useMemo(() => {
    const currentPath = pendingPath || pathname;
    const CONTENT_SECTION_TYPES = ["faq", "testimonials", "features", "cta"];
    
    // Check if we're on a content item edit route (e.g., /admin/testimonials/[id]/edit)
    const contentItemRouteMatch = currentPath.match(/\/admin\/(testimonials|faq|features|cta)\/[^/]+\/edit/);
    if (contentItemRouteMatch) {
      // Check if returnTo parameter points to a section on this page
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        // Parse page ID and section ID from returnTo URL: /admin/pages/[pageId]/sections/[sectionId]?tab=...
        const returnToMatch = returnTo.match(/\/admin\/pages\/([^/]+)\/sections\/([^/?]+)/);
        if (returnToMatch && returnToMatch[1] === page.id) {
          // Check if the section belongs to this page
          const sectionId = returnToMatch[2];
          return sections.some((section) => section.id === sectionId);
        }
      }
      // Fallback: check if this page has a section of this content type
      const contentType = contentItemRouteMatch[1];
      return sections.some((section) => (section as any).type === contentType);
    }
    
    return (
      currentPath === `/admin/pages/${page.id}/sections` ||
      currentPath.startsWith(`/admin/pages/${page.id}/`) ||
      sections.some((section) => {
        const sectionType = (section as any).type;
        const isContentSection = CONTENT_SECTION_TYPES.includes(sectionType);
        const isHeroSection = sectionType === "hero";
        // Check new URL structure: /admin/pages/[pageId]/sections/[sectionId]/...
        const newSectionPath = `/admin/pages/${page.id}/sections/${section.id}`;
        if (isContentSection) {
          // For content sections, check items, edit, and old routes
          return (
            currentPath.startsWith(`${newSectionPath}/items`) ||
            currentPath === `${newSectionPath}/edit` ||
            currentPath === `/admin/sections/${section.id}` ||
            currentPath === `/admin/sections/${section.id}/edit`
          );
        } else if (isHeroSection) {
          // For hero sections, check media, cta, edit, and old routes
          return (
            currentPath === `${newSectionPath}/media` ||
            currentPath === `${newSectionPath}/cta` ||
            currentPath === `${newSectionPath}/edit` ||
            currentPath === `/admin/sections/${section.id}` ||
            currentPath === `/admin/sections/${section.id}/edit` ||
            currentPath.startsWith(`/admin/sections/${section.id}?`)
          );
        } else {
          // For other non-content sections, check edit and old routes
          return (
            currentPath === `${newSectionPath}/edit` ||
            currentPath === `/admin/sections/${section.id}/edit`
          );
        }
      })
    );
  }, [pathname, pendingPath, page.id, sections]);

  const viewAllSectionsHref = `/admin/pages/${page.id}/sections`;
  const currentPath = pendingPath || pathname;
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
            isPageActive ? "text-primary" : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
          )}
        />
        <span className="relative flex-1 text-left">{page.title}</span>
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
              isViewAllActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
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
              const isLogosSection = (section as any).type === "logos";
              const isFooterSection = (section as any).type === "footer";
              
              // Determine section href based on type (using query params)
              const sectionBase = `/admin/pages/${page.id}/sections/${section.id}`;
              let sectionHref: string;
              if (isHeroSection) {
                sectionHref = `${sectionBase}?tab=media`;
              } else if (isHeaderSection) {
                sectionHref = `${sectionBase}?tab=cta`;
              } else if (isLogosSection) {
                sectionHref = `${sectionBase}?tab=softwares`;
              } else if (isFooterSection) {
                sectionHref = `${sectionBase}?tab=social-platforms`;
              } else if (isContentSection) {
                // Use section-type-specific tab name
                const sectionType = (section as any).type;
                if (sectionType === "faq") {
                  sectionHref = `${sectionBase}?tab=faq`;
                } else if (sectionType === "testimonials") {
                  sectionHref = `${sectionBase}?tab=testimonials`;
                } else if (sectionType === "features") {
                  sectionHref = `${sectionBase}?tab=features`;
                } else if (sectionType === "timeline") {
                  sectionHref = `${sectionBase}?tab=timeline`;
                } else if (sectionType === "results") {
                  sectionHref = `${sectionBase}?tab=results`;
                } else if (sectionType === "cta") {
                  sectionHref = `${sectionBase}?tab=cta`;
                } else {
                  sectionHref = `${sectionBase}?tab=edit`;
                }
              } else {
                sectionHref = `${sectionBase}?tab=edit`;
              }
              
              const currentPath = pendingPath || pathname;
              
              // Check if we're on a section route (new query param routes or old routes for backward compatibility)
              let isSectionActive = false;
              
              // Check if pathname matches section base (with or without query params)
              if (currentPath.startsWith(sectionBase)) {
                // Check for exact match or old route structure
                if (currentPath === sectionBase ||
                    currentPath === `${sectionBase}/items` ||
                    currentPath === `${sectionBase}/media` ||
                    currentPath === `${sectionBase}/cta` ||
                    currentPath === `${sectionBase}/edit` ||
                    currentPath.startsWith(`${sectionBase}/items/`)) {
                  isSectionActive = true;
                }
              }
              
              // Check old routes for backward compatibility
              if (!isSectionActive) {
                isSectionActive = 
                  currentPath === `/admin/sections/${section.id}` || 
                  currentPath === `/admin/sections/${section.id}/edit`;
              }
              
              // Check content item edit routes (old and new)
              if (!isSectionActive && isContentSection) {
                const sectionType = (section as any).type;
                const oldContentItemRoutePattern = new RegExp(`^/admin/${sectionType}/[^/]+/edit$`);
                const newContentItemRoutePattern = new RegExp(`^/admin/pages/[^/]+/sections/[^/]+/items/[^/]+/edit$`);
                
                // Check if we're on a content item edit route
                if (oldContentItemRoutePattern.test(currentPath) || newContentItemRoutePattern.test(currentPath)) {
                  // Check if returnTo parameter points to this section
                  const returnTo = searchParams.get('returnTo');
                  if (returnTo) {
                    // Parse section ID from returnTo URL: /admin/pages/[pageId]/sections/[sectionId]?tab=...
                    const returnToMatch = returnTo.match(/\/admin\/pages\/[^/]+\/sections\/([^/?]+)/);
                    if (returnToMatch && returnToMatch[1] === section.id) {
                      isSectionActive = true;
                    }
                  } else {
                    // Fallback: if no returnTo, check if page has matching section type
                    isSectionActive = true;
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
