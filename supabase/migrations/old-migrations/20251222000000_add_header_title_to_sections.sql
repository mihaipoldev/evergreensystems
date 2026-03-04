-- Add headerTitle column to sections table
-- This allows sections to have a custom title for use in the navbar/header menu
-- The headerTitle will be populated with the section type value for existing sections

ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS header_title TEXT;

-- Populate headerTitle with type value for all existing sections
UPDATE public.sections 
SET header_title = type 
WHERE header_title IS NULL;
