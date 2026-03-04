-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create website_colors table (website-wide, not user-specific)
CREATE TABLE IF NOT EXISTS public.website_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    hex TEXT NOT NULL,
    hsl_h INTEGER NOT NULL,
    hsl_s INTEGER NOT NULL,
    hsl_l INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_website_colors_created_at ON public.website_colors(created_at DESC);

-- Function to update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_website_colors_updated_at
    BEFORE UPDATE ON public.website_colors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
