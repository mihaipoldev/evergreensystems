-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create website_settings_presets table
CREATE TABLE IF NOT EXISTS public.website_settings_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    primary_color_id UUID REFERENCES public.website_colors(id) ON DELETE SET NULL,
    font_family TEXT NOT NULL DEFAULT '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for name for quick lookups
CREATE INDEX IF NOT EXISTS idx_website_settings_presets_name ON public.website_settings_presets(name);

-- Create index for primary_color_id foreign key
CREATE INDEX IF NOT EXISTS idx_website_settings_presets_primary_color_id ON public.website_settings_presets(primary_color_id);

-- Function to update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_website_settings_presets_updated_at
    BEFORE UPDATE ON public.website_settings_presets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.website_settings_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for website_settings_presets table
-- Public can SELECT (read) presets
CREATE POLICY "Public can view website settings presets"
    ON public.website_settings_presets
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT presets
CREATE POLICY "Authenticated users can insert website settings presets"
    ON public.website_settings_presets
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can UPDATE presets
CREATE POLICY "Authenticated users can update website settings presets"
    ON public.website_settings_presets
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can DELETE presets
CREATE POLICY "Authenticated users can delete website settings presets"
    ON public.website_settings_presets
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
