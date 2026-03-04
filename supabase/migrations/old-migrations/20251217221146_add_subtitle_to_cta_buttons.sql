-- Add subtitle field to cta_buttons table
-- This allows CTA buttons to have an optional subtitle text

ALTER TABLE public.cta_buttons 
ADD COLUMN IF NOT EXISTS subtitle TEXT;
