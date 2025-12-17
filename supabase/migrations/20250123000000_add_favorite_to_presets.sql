-- Add favorite column to website_settings_presets table
ALTER TABLE public.website_settings_presets 
ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false;

-- Create index for efficient sorting queries
CREATE INDEX IF NOT EXISTS idx_website_settings_presets_favorite 
ON public.website_settings_presets(favorite);
