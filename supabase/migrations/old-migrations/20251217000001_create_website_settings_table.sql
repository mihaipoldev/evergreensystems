-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create website_settings table (website-wide, single row constraint)
-- Use a singleton pattern with a constant 'singleton' value
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'singleton',
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    primary_color_id UUID REFERENCES public.website_colors(id) ON DELETE SET NULL,
    font_family TEXT NOT NULL DEFAULT '{"landing":{"heading":"gotham","body":"gotham"}}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for primary_color_id foreign key
CREATE INDEX IF NOT EXISTS idx_website_settings_primary_color_id ON public.website_settings(primary_color_id);

-- Function to update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_website_settings_updated_at
    BEFORE UPDATE ON public.website_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
