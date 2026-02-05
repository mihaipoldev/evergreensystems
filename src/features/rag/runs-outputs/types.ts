/** UI schema section: component rendering instructions */
export type UiSchemaSection = {
  component: string;
  props?: Record<string, unknown>;
  children?: UiSchemaSection[];
};

export type UiSchema = {
  sections?: UiSchemaSection[];
};

export type RunOutput = {
  id: string;
  run_id: string;
  output_json: Record<string, any>; // JSONB - full final niche_intelligence output schema
  pdf_storage_path: string | null;
  ui_schema: UiSchema | null; // JSONB - optional component rendering instructions
  created_at: string;
};

export type RunDocumentRole = "directory" | "ranked_list" | "company_site" | "job_post" | "kpi_reference" | "other";

export type RunDocument = {
  id: string;
  run_id: string;
  document_id: string;
  role: RunDocumentRole | null;
  metadata: Record<string, any>; // JSONB - optional extra info (e.g., original URL, scrape tool)
  created_at: string;
};

