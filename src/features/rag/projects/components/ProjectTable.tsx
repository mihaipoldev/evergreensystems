"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { ProjectRow } from "./ProjectRow";
import type { Project } from "../types";
import type { ProjectType } from "@/features/rag/project-type/types";
import { AnimatedTable } from "@/features/rag/shared/components/AnimatedTable";
import { getFitScoreCategory, getFitScoreBadgeClasses } from "@/features/rag/shared/utils/fitScoreColors";

type ProjectWithCount = Project & { 
  document_count?: number; 
  linked_kb_name?: string | null;
  niche_intelligence_verdict?: "pursue" | "test" | "caution" | "avoid" | null;
  niche_intelligence_fit_score?: number | null;
};

interface ProjectTableProps {
  projects: ProjectWithCount[];
  projectTypes?: ProjectType[];
  projectTypeName?: string | null;
  groupByVerdict?: boolean;
  onDelete?: () => void;
  onEdit?: (project: Project) => void;
}

export function ProjectTable({
  projects,
  projectTypes = [],
  projectTypeName,
  groupByVerdict = false,
  onDelete,
  onEdit,
}: ProjectTableProps) {
  // Create a map of project type IDs to project types for quick lookup
  const projectTypeMap = new Map(projectTypes.map(pt => [pt.id, pt]));
  const isNicheProject = projectTypeName === "niche";
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const hasInitializedExpansion = useRef(false);
  
  // Create projectIds array for range selection
  const projectIds = projects.map(p => p.id);

  // Expand all groups by default when grouping is first enabled
  useEffect(() => {
    if (groupByVerdict && !hasInitializedExpansion.current) {
      const verdicts = ["no_verdict", "ideal", "pursue", "test", "caution", "avoid"];
      setExpandedGroups(new Set(verdicts));
      hasInitializedExpansion.current = true;
    }
    if (!groupByVerdict) {
      hasInitializedExpansion.current = false;
    }
  }, [groupByVerdict]);

  // Group projects by verdict when grouping is enabled
  const groupedProjects = useMemo(() => {
    if (!groupByVerdict || !isNicheProject) {
      return null;
    }

    const groups: Record<string, ProjectWithCount[]> = {
      no_verdict: [], // Group for projects without verdict (at the top)
      ideal: [],
      pursue: [],
      test: [],
      caution: [],
      avoid: [],
    };

    projects.forEach((project) => {
      const verdict = project.niche_intelligence_verdict;
      const fitScore = project.niche_intelligence_fit_score;
      
      // Check if project has no verdict (both fit score and verdict are null/undefined)
      if ((fitScore === null || fitScore === undefined) && (!verdict)) {
        groups.no_verdict.push(project);
      } else {
        const category = getFitScoreCategory(fitScore ?? null, verdict ?? null);
        
        if (groups[category]) {
          groups[category].push(project);
        }
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [projects, groupByVerdict, isNicheProject]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const getDotColorClass = (verdict: string): string => {
    switch (verdict) {
      case "no_verdict":
        return "bg-gray-400";
      case "ideal":
        return "bg-emerald-500";
      case "pursue":
        return "bg-green-600";
      case "test":
        return "bg-yellow-600";
      case "caution":
        return "bg-orange-600";
      case "avoid":
        return "bg-red-600";
      default:
        return "bg-muted";
    }
  };

  const getVerdictLabel = (verdict: string): string => {
    switch (verdict) {
      case "no_verdict":
        return "No Verdict";
      case "ideal":
        return "Ideal";
      case "pursue":
        return "Pursue";
      case "test":
        return "Test";
      case "caution":
        return "Caution";
      case "avoid":
        return "Avoid";
      default:
        return verdict;
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2">
          {/* Table Header - Conditional */}
          {!groupByVerdict && (
            <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex-1 min-w-0">Name</div>
              {!isNicheProject && <div className="w-24 shrink-0">Status</div>}
              {isNicheProject && <div className="w-32 shrink-0">Fit Score</div>}
              <div className="w-28 shrink-0">Updated</div>
              <div className="w-20 shrink-0 text-right">Actions</div>
            </div>
          )}

        {/* Grouped View */}
        {groupByVerdict && groupedProjects ? (
          <>
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex-1 min-w-0">Name</div>
              {!isNicheProject && <div className="w-24 shrink-0">Status</div>}
              {isNicheProject && <div className="w-32 shrink-0">Fit Score</div>}
              <div className="w-28 shrink-0">Updated</div>
              <div className="w-20 shrink-0 text-right">Actions</div>
            </div>

            {/* Verdict Groups */}
            {Object.entries(groupedProjects)
              .sort(([a], [b]) => {
                // Order: no_verdict (at top), then ideal, pursue, test, caution, avoid
                const order: Record<string, number> = {
                  no_verdict: 0,
                  ideal: 1,
                  pursue: 2,
                  test: 3,
                  caution: 4,
                  avoid: 5,
                };
                return (order[a] ?? 99) - (order[b] ?? 99);
              })
              .map(([verdict, verdictProjects]) => {
                const verdictLabel = getVerdictLabel(verdict);
                const dotColor = getDotColorClass(verdict);

                return (
                  <Collapsible
                    key={verdict}
                    open={expandedGroups.has(verdict)}
                    onOpenChange={() => toggleGroup(verdict)}
                  >
                    <CollapsibleTrigger className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg">
                      <FontAwesomeIcon
                        icon={expandedGroups.has(verdict) ? faChevronDown : faChevronRight}
                        className="h-4 w-4 text-muted-foreground shrink-0"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`h-2 w-2 rounded-full ${dotColor}`}></span>
                        <h3 className="text-sm font-semibold text-foreground capitalize">{verdictLabel}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {verdictProjects.length} {verdictProjects.length === 1 ? "project" : "projects"}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pt-2 space-y-2">
                        {verdictProjects.map((project) => {
                          const projectType = project.project_type_id ? projectTypeMap.get(project.project_type_id) : null;
                          const projectIndex = projects.findIndex(p => p.id === project.id);
                          return (
                            <ProjectRow
                              key={project.id}
                              project={project}
                              projectTypeIcon={projectType?.icon || null}
                              isNicheProject={isNicheProject}
                              projectTypes={projectTypes}
                              projectTypeName={projectTypeName}
                              onDelete={onDelete}
                              onEdit={onEdit}
                              index={projectIndex !== -1 ? projectIndex : undefined}
                              projectIds={projectIds}
                            />
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
          </>
        ) : (
          /* Non-Grouped View */
          <AnimatedTable
            getKey={(_, index) => projects[index]?.id || index}
            staggerDelay={0.02}
          >
            {projects.map((project, index) => {
              const projectType = project.project_type_id ? projectTypeMap.get(project.project_type_id) : null;
              return (
                <ProjectRow
                  key={project.id}
                  project={project}
                  projectTypeIcon={projectType?.icon || null}
                  isNicheProject={isNicheProject}
                  projectTypes={projectTypes}
                  projectTypeName={projectTypeName}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  index={index}
                  projectIds={projectIds}
                />
              );
            })}
          </AnimatedTable>
        )}
      </div>
    </TooltipProvider>
  );
}

