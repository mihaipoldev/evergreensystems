export type Workflow = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  icon: string | null;
  estimated_cost: number | null;
  estimated_time_minutes: number | null;
  input_schema: Record<string, any> | null;
  enabled: boolean;
  knowledge_base_target: string;
  target_knowledge_base_id: string | null;
  created_at: string;
  updated_at: string;
};

