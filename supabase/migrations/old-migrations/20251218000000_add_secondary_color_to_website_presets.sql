-- Add secondary_color_id column to website_settings_presets table
ALTER TABLE public.website_settings_presets
ADD COLUMN IF NOT EXISTS secondary_color_id UUID REFERENCES public.website_colors(id) ON DELETE SET NULL;

-- Create index for secondary_color_id foreign key for performance
CREATE INDEX IF NOT EXISTS idx_website_settings_presets_secondary_color_id 
ON public.website_settings_presets(secondary_color_id);
