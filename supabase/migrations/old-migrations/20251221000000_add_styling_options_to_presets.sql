-- Add styling_options JSONB column to website_settings_presets table
ALTER TABLE public.website_settings_presets 
ADD COLUMN IF NOT EXISTS styling_options JSONB DEFAULT '{"dots_enabled": true}'::jsonb;

-- Update existing presets to have dots_enabled set to true if they don't have styling_options
UPDATE public.website_settings_presets
SET styling_options = '{"dots_enabled": true}'::jsonb
WHERE styling_options IS NULL OR styling_options::text = 'null';
