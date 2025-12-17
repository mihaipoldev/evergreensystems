-- Update website_settings table to support production and development environments

-- Step 1: Update existing 'singleton' row to 'production' if it exists
UPDATE public.website_settings
SET id = 'production'
WHERE id = 'singleton';

-- Step 2: Remove default value constraint and add CHECK constraint
-- First, drop the default
ALTER TABLE public.website_settings
ALTER COLUMN id DROP DEFAULT;

-- Add CHECK constraint to ensure id is either 'production' or 'development'
ALTER TABLE public.website_settings
ADD CONSTRAINT website_settings_id_check CHECK (id IN ('production', 'development'));

-- Step 3: Create 'development' row with default values if it doesn't exist
INSERT INTO public.website_settings (id, theme, font_family)
SELECT 
  'development' as id,
  'dark' as theme,
  '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}' as font_family
WHERE NOT EXISTS (
  SELECT 1 FROM public.website_settings WHERE id = 'development'
);

-- Step 4: Ensure 'production' row exists (in case there was no singleton row)
INSERT INTO public.website_settings (id, theme, font_family)
SELECT 
  'production' as id,
  'dark' as theme,
  '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}' as font_family
WHERE NOT EXISTS (
  SELECT 1 FROM public.website_settings WHERE id = 'production'
);
