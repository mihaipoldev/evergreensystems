"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Map route segments to display names
const staticRouteMap: Record<string, string> = {
  "": "Intel Dashboard",
  dashboard: "Intel Dashboard",
  "knowledge-bases": "Knowledge Bases",
  projects: "Projects",
  documents: "Documents",
  runs: "Runs",
  reports: "Reports",
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

export function IntelPageTitle() {
  const pathname = usePathname();
  const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      fetchProjectName(projectId)
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
  }, [knowledgeBaseId, projectId]);

  // Get static title or dynamic title
  let title: string;
  if (isKnowledgeBaseDetail || isProjectDetail) {
    title = isLoading ? "Loading..." : (dynamicTitle || (isKnowledgeBaseDetail ? "Knowledge Base" : "Project"));
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
    <span className="font-bold text-foreground text-2xl">
      {title}
    </span>
  );
}

