import type { Workflow } from "../workflows/types";

export type SubjectType = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  icon: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type SubjectTypeWithWorkflows = SubjectType & {
  workflows: Workflow[];
};

