"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Map route segments to display names
const staticRouteMap: Record<string, string> = {
  "": "Dashboard",
  dashboard: "Dashboard",
  "knowledge-bases": "Knowledge Bases",
  projects: "Projects",
  documents: "Documents",
  runs: "Runs",
  reports: "Reports",
  workflows: "Workflows",
  new: "Create Project",
};

async function fetchKnowledgeBaseName(id: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/intel/knowledge-base/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.error("Error fetching knowledge base name:", error);
    return null;
  }
}

async function fetchProjectName(id: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/intel/projects/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.client_name || null;
  } catch (error) {
    console.error("Error fetching project name:", error);
    return null;
  }
}

async function fetchProjectType(id: string): Promise<{ label: string; name: string } | null> {
  try {
    const response = await fetch(`/api/intel/projects/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.project_type_id) {
      // Fetch project type details
      try {
        const typeResponse = await fetch(`/api/intel/project-types/${data.project_type_id}`);
        if (typeResponse.ok) {
          const typeData = await typeResponse.json();
          return {
            label: typeData.label || typeData.name,
            name: typeData.name,
          };
        }
      } catch (typeError) {
        // If project-types endpoint doesn't exist or fails, return null
        console.error("Error fetching project type:", typeError);
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching project type:", error);
    return null;
  }
}


async function fetchWorkflowName(id: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/intel/workflows/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.label || null;
  } catch (error) {
    console.error("Error fetching workflow name:", error);
    return null;
  }
}

export function IntelPageTitle() {
  const pathname = usePathname();
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<{ label: string; name: string } | null>(null);
  
  // Parse the pathname
  const segments = pathname.split("/").filter(Boolean);

  // Remove "intel" from segments if present
  const intelIndex = segments.indexOf("intel");
  const relevantSegments = intelIndex >= 0 ? segments.slice(intelIndex + 1) : segments;

  // Determine if we need to fetch a dynamic title
  const isKnowledgeBaseDetail = relevantSegments[0] === "knowledge-bases" && relevantSegments.length >= 2;
  const knowledgeBaseId = isKnowledgeBaseDetail ? relevantSegments[1] : null;

  const isProjectDetail = relevantSegments[0] === "projects" && relevantSegments.length >= 2 && relevantSegments[1] !== "new";
  const projectId = isProjectDetail ? relevantSegments[1] : null;

  const isWorkflowDetail = relevantSegments[0] === "workflows" && relevantSegments.length >= 2;
  const workflowId = isWorkflowDetail ? relevantSegments[1] : null;
  
  // Set loading state immediately if we're on a detail page that needs fetching
  const [isLoading, setIsLoading] = useState(isProjectDetail || isKnowledgeBaseDetail || isWorkflowDetail);

  // Fetch dynamic titles
  useEffect(() => {
    if (knowledgeBaseId) {
      setIsLoading(true);
      fetchKnowledgeBaseName(knowledgeBaseId)
        .then((name) => {
          setDynamicTitle(name);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else if (projectId) {
      setIsLoading(true);
      Promise.all([
        fetchProjectName(projectId),
        fetchProjectType(projectId)
      ])
        .then(([name, type]) => {
          setDynamicTitle(name);
          setProjectType(type);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else if (workflowId) {
      setIsLoading(true);
      fetchWorkflowName(workflowId)
        .then((name) => {
          setDynamicTitle(name);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setDynamicTitle(null);
    }
  }, [knowledgeBaseId, projectId, workflowId]);

  // Get static title or dynamic title
  let title: string;
  if (isKnowledgeBaseDetail || isProjectDetail || isWorkflowDetail) {
    // For detail pages, show the parent page name (e.g., "Projects", "Knowledge Bases")
    // For project detail pages, just show "Project"
    if (isProjectDetail) {
      title = "Project";
    } else {
      const parentSegment = relevantSegments[0] || "";
      title = staticRouteMap[parentSegment] || parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1);
    }
  } else {
    const firstSegment = relevantSegments[0] || "";
    const secondSegment = relevantSegments[1] || "";
    
    // Handle nested routes like /intel/projects/new
    if (firstSegment === "projects" && secondSegment === "new") {
      title = staticRouteMap["new"] || "Create Project";
    } else {
      title = staticRouteMap[firstSegment] || firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
    }
  }

  return (
    <span className="md:font-bold text-foreground text-lg md:text-xl">
      {title}
    </span>
  );
}

