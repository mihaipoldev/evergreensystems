import type { Run } from "@/features/rag/runs/types";

export type RunWithExtras = Run & { 
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
  report_id?: string | null;
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
      { id: 'documents', label: 'Documents' },
      { id: 'runs', label: 'Researches' },
    ],
  },
  niche: {
    tabs: [
      { id: 'documents', label: 'Documents' },
      { id: 'runs', label: 'Researches' },
    ],
  },
  // Default fallback
  default: {
    tabs: [
      { id: 'documents', label: 'Documents' },
      { id: 'runs', label: 'Researches' },
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

