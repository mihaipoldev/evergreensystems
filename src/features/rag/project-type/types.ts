import type { Workflow } from "../workflows/types";

export type ProjectType = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  icon: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectTypeWithWorkflows = ProjectType & {
  workflows: Workflow[];
};

// Backward compatibility: SubjectType is an alias for ProjectType
export type SubjectType = ProjectType;
export type SubjectTypeWithWorkflows = ProjectTypeWithWorkflows;

