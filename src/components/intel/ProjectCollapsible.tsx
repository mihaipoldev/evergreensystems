"use client";

import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faTag } from "@fortawesome/free-solid-svg-icons";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/features/rag/project-type/types";

type ProjectCollapsibleProps = {
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  pendingPath: string | null;
  searchParams: URLSearchParams;
  onNavigate: (href: string) => void;
  getIsActive: (href: string) => boolean;
};

export function ProjectCollapsible({
  isOpen,
  onToggle,
  pathname,
  pendingPath,
  searchParams,
  onNavigate,
  getIsActive,
}: ProjectCollapsibleProps) {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjectTypes() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/intel/project-types?enabled=true");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch project types");
        }

        const data = await response.json();
        setProjectTypes(data || []);
      } catch (err) {
        console.error("Error fetching project types:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProjectTypes();
  }, []);

  // Handle manual toggle
  const handleToggle = () => {
    onToggle();
  };

  // Check if we're on any projects page
  const isProjectsActive = useMemo(() => {
    const currentPath = pendingPath || pathname;
    return currentPath.startsWith("/intel/projects");
  }, [pathname, pendingPath]);

  // Sort project types alphabetically by label (or name if label is not available)
  const sortedProjectTypes = useMemo(() => {
    return [...projectTypes].sort((a, b) => {
      const labelA = a.label || a.name;
      const labelB = b.label || b.name;
      return labelA.localeCompare(labelB);
    });
  }, [projectTypes]);

  const projectsListHref = "/intel/projects";

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={handleToggle} 
      className="w-full min-w-0"
      style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
    >
      <div
        className={cn(
          "group flex items-center gap-0 rounded-sm px-4 py-2 text-[16px] font-medium w-full",
          "relative overflow-hidden overflow-x-hidden min-w-0 max-w-full",
          isProjectsActive
            ? "bg-primary/10 text-sidebar-foreground shadow-sm"
            : "text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-primary/10"
        )}
        style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
      >
        <Link
          href={projectsListHref}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(projectsListHref);
          }}
          className="flex items-center gap-4 flex-1 min-w-0 max-w-full active:scale-[0.98] overflow-hidden"
          style={{ minWidth: 0, maxWidth: '100%' }}
        >
          <FontAwesomeIcon
            icon={faFolder}
            className={cn(
              "h-4 w-4 transition-colors shrink-0 flex-shrink-0",
              isProjectsActive ? "text-primary" : "text-sidebar-foreground/90 group-hover:text-sidebar-foreground"
            )}
          />
          <span className="relative flex-1 text-left truncate min-w-0" style={{ width: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Projects</span>
        </Link>
        <CollapsibleTrigger
          className="shrink-0 flex-shrink-0 ml-auto p-1 rounded active:scale-[0.98] group/chevron"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-100 group-hover/chevron:scale-110",
              isOpen ? "rotate-90" : "rotate-180",
              isProjectsActive ? "text-primary" : "text-sidebar-foreground/70"
            )}
          />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent 
        className="pl-2 pr-10 space-y-0.5 mt-0.5 overflow-hidden overflow-x-hidden w-full min-w-0 max-w-full border-l border-border/50 ml-4"
        style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
      >
        <div className="space-y-0.5 w-full min-w-0 max-w-full" style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
          {/* Individual project type links */}
        {loading ? (
          <div className="px-4 py-1.5 text-sm text-muted-foreground">Loading project types...</div>
        ) : error ? (
          <div className="px-4 py-1.5 text-sm text-destructive">{error}</div>
        ) : sortedProjectTypes.length === 0 ? (
          <div className="px-4 py-1.5 text-sm text-muted-foreground">No project types found</div>
        ) : (
          sortedProjectTypes.map((projectType) => {
            const href = `/intel/projects?project_type_id=${projectType.id}`;
            // Check if this project type is active by comparing the project_type_id in searchParams
            const isActive = searchParams.get("project_type_id") === projectType.id;

            return (
              <Link
                key={projectType.id}
                href={href}
                onClick={() => onNavigate(href)}
                className={cn(
                  "group flex items-center gap-3 rounded-sm px-4 py-2 text-[14px] font-medium w-full",
                  "relative overflow-hidden overflow-x-hidden min-w-0 max-w-full",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-primary/10 text-sidebar-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-primary/10"
                )}
                style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
              >
                {projectType.icon ? (
                  <span className={cn(
                    "text-base transition-colors shrink-0 flex-shrink-0",
                    isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  )}>
                    {projectType.icon}
                  </span>
                ) : (
                  <FontAwesomeIcon
                    icon={faTag}
                    className={cn(
                      "h-4 w-4 transition-colors shrink-0 flex-shrink-0",
                      isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                    )}
                  />
                )}
                <span className="relative flex-1 truncate min-w-0" style={{ width: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{projectType.label || projectType.name}</span>
              </Link>
            );
          })
        )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

