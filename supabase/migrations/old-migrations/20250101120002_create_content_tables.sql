-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    content JSONB,
    position INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cta_buttons table
CREATE TABLE IF NOT EXISTS public.cta_buttons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    style TEXT,
    icon TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create offer_features table
CREATE TABLE IF NOT EXISTS public.offer_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    icon TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT,
    company_name TEXT,
    quote TEXT NOT NULL,
    video_url TEXT,
    avatar_url TEXT,
    approved BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create faq_items table
CREATE TABLE IF NOT EXISTS public.faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    alt TEXT,
    category TEXT,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    page TEXT,
    section TEXT,
    element TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes on foreign key columns for better query performance
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON public.sections(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_position ON public.sections(position);
CREATE INDEX IF NOT EXISTS idx_sections_visible ON public.sections(visible);
CREATE INDEX IF NOT EXISTS idx_cta_buttons_section_id ON public.cta_buttons(section_id);
CREATE INDEX IF NOT EXISTS idx_cta_buttons_position ON public.cta_buttons(position);
CREATE INDEX IF NOT EXISTS idx_offer_features_section_id ON public.offer_features(section_id);
CREATE INDEX IF NOT EXISTS idx_offer_features_position ON public.offer_features(position);
CREATE INDEX IF NOT EXISTS idx_testimonials_section_id ON public.testimonials(section_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_position ON public.testimonials(position);
CREATE INDEX IF NOT EXISTS idx_faq_items_section_id ON public.faq_items(section_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_position ON public.faq_items(position);
CREATE INDEX IF NOT EXISTS idx_media_assets_section_id ON public.media_assets(section_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON public.media_assets(category);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON public.analytics_events(page);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Create triggers to automatically update updated_at on row updates
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON public.sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cta_buttons_updated_at
    BEFORE UPDATE ON public.cta_buttons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offer_features_updated_at
    BEFORE UPDATE ON public.offer_features
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at
    BEFORE UPDATE ON public.faq_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at
    BEFORE UPDATE ON public.media_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_events_updated_at
    BEFORE UPDATE ON public.analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
