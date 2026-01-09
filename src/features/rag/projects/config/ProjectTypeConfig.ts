import type { Run } from "@/features/rag/runs/types";

export type RunWithExtras = Run & { 
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
  report_id?: string | null;
  fit_score?: number | null;
  verdict?: "pursue" | "test" | "caution" | "avoid" | null;
};

export type TabConfig = {
  id: string;
  label: string;
};

export type ProjectTypeConfig = {
  tabs: TabConfig[];
  // Future: headerComponent, statsComponent, etc.
};

export const PROJECT_TYPE_CONFIG: Record<string, ProjectTypeConfig> = {
  client: {
    tabs: [
      { id: 'runs', label: 'Researches' },
      { id: 'documents', label: 'Documents' },
    ],
  },
  niche: {
    tabs: [
      { id: 'runs', label: 'Researches' },
      { id: 'documents', label: 'Documents' },
    ],
  },
  // Default fallback
  default: {
    tabs: [
      { id: 'runs', label: 'Researches' },
      { id: 'documents', label: 'Documents' },
    ],
  },
};

/**
 * Get project type configuration
 */
export function getProjectTypeConfig(projectTypeName: string | null | undefined): ProjectTypeConfig {
  if (!projectTypeName) {
    return PROJECT_TYPE_CONFIG.default;
  }
  return PROJECT_TYPE_CONFIG[projectTypeName] || PROJECT_TYPE_CONFIG.default;
}

