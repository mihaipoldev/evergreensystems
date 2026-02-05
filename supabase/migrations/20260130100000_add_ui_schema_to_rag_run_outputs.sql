-- Add ui_schema JSONB column to rag_run_outputs
-- Stores component rendering instructions for each automation output (optional, nullable)
-- Example: { "sections": [{ "component": "SectionWrapper", "props": { "title": "Overview", "number": 1 }, "children": [] }] }

ALTER TABLE public.rag_run_outputs
ADD COLUMN IF NOT EXISTS ui_schema jsonb DEFAULT NULL;

COMMENT ON COLUMN public.rag_run_outputs.ui_schema IS 'Optional UI schema: component rendering instructions (sections with component, props, children).';
