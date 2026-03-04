-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_colors table
CREATE TABLE IF NOT EXISTS public.user_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hex TEXT NOT NULL,
    hsl_h INTEGER NOT NULL,
    hsl_s INTEGER NOT NULL,
    hsl_l INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_themes table
CREATE TABLE IF NOT EXISTS public.user_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    primary_color_id UUID NOT NULL REFERENCES public.user_colors(id) ON DELETE RESTRICT,
    secondary_color_id UUID NOT NULL REFERENCES public.user_colors(id) ON DELETE RESTRICT,
    accent_color_id UUID NOT NULL REFERENCES public.user_colors(id) ON DELETE RESTRICT,
    font_family TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    active_theme_id UUID REFERENCES public.user_themes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes on foreign key columns for better query performance
CREATE INDEX IF NOT EXISTS idx_user_colors_user_id ON public.user_colors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_themes_user_id ON public.user_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_themes_primary_color_id ON public.user_themes(primary_color_id);
CREATE INDEX IF NOT EXISTS idx_user_themes_secondary_color_id ON public.user_themes(secondary_color_id);
CREATE INDEX IF NOT EXISTS idx_user_themes_accent_color_id ON public.user_themes(accent_color_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_active_theme_id ON public.user_settings(active_theme_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at on row updates
CREATE TRIGGER update_user_colors_updated_at
    BEFORE UPDATE ON public.user_colors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_themes_updated_at
    BEFORE UPDATE ON public.user_themes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

