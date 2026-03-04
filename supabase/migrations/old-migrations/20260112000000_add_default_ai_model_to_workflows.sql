-- =========================================================
-- Add default_ai_model Column to Workflows Table
-- =========================================================
-- This migration adds a required default_ai_model field to workflows
-- that specifies which AI model is used for research.
-- =========================================================

-- Add default_ai_model column with default value for existing rows
ALTER TABLE public.workflows
ADD COLUMN IF NOT EXISTS default_ai_model TEXT NOT NULL DEFAULT 'anthropic/claude-haiku-4.5';

-- Update existing rows to have the default value (in case any exist without it)
UPDATE public.workflows
SET default_ai_model = 'anthropic/claude-haiku-4.5'
WHERE default_ai_model IS NULL;

-- Add CHECK constraint to validate against allowed model values
ALTER TABLE public.workflows
ADD CONSTRAINT check_default_ai_model_valid
CHECK (
  default_ai_model IN (
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
CREATE INDEX IF NOT EXISTS idx_workflows_default_ai_model
ON public.workflows(default_ai_model);

