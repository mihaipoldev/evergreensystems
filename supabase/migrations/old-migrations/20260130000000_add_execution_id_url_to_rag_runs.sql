-- Add execution_id and execution_url to rag_runs for n8n retry workflow
-- These store the n8n execution reference when available (e.g. from execute webhook response)

ALTER TABLE public.rag_runs
  ADD COLUMN IF NOT EXISTS execution_id text,
  ADD COLUMN IF NOT EXISTS execution_url text;
