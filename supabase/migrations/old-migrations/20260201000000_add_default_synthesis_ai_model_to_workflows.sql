-- =========================================================
-- Add default_synthesis_ai_model Column to Workflows Table
-- =========================================================
-- This migration adds a default_synthesis_ai_model field to workflows
-- that specifies which AI model is used for synthesis.
-- =========================================================

-- Add default_synthesis_ai_model column with default value for new rows
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS default_synthesis_ai_model TEXT NOT NULL DEFAULT 'anthropic/claude-haiku-4.5';

-- Backfill existing rows: use default_ai_model so synthesis matches research
UPDATE public.workflows
SET default_synthesis_ai_model = default_ai_model;

-- Add CHECK constraint to validate against allowed model values
ALTER TABLE public.workflows
ADD CONSTRAINT check_default_synthesis_ai_model_valid
CHECK (
  default_synthesis_ai_model IN (
    'anthropic/claude-sonnet-4.5',
    'anthropic/claude-haiku-4.5',
    'google/gemini-3-flash-preview',
    'google/gemini-3-pro-preview',
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
    'openai/gpt-5-mini',
    'openai/gpt-5.2'
  )
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_workflows_default_synthesis_ai_model
ON public.workflows(default_synthesis_ai_model);
