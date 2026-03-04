-- Create media table for storing media items (images, videos, files)
-- Supports multiple source types: upload, wistia, youtube, vimeo, external_url
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'file')),
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'wistia', 'youtube', 'vimeo', 'external_url')),
    url TEXT NOT NULL,
    embed_id TEXT,
    name TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create section_media junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.section_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'main',
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, media_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
CREATE INDEX IF NOT EXISTS idx_media_source_type ON public.media(source_type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at);
CREATE INDEX IF NOT EXISTS idx_section_media_section_id ON public.section_media(section_id);
CREATE INDEX IF NOT EXISTS idx_section_media_media_id ON public.section_media(media_id);
CREATE INDEX IF NOT EXISTS idx_section_media_sort_order ON public.section_media(section_id, sort_order);

-- Add trigger for updated_at on media table
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on both tables
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media table
-- Public can view media
CREATE POLICY "Public can view media"
    ON public.media
    FOR SELECT
    USING (true);

-- Authenticated users can insert media
CREATE POLICY "Authenticated users can insert media"
    ON public.media
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update media
CREATE POLICY "Authenticated users can update media"
    ON public.media
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete media
CREATE POLICY "Authenticated users can delete media"
    ON public.media
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for section_media table
-- Public can view section_media
CREATE POLICY "Public can view section_media"
    ON public.section_media
    FOR SELECT
    USING (true);

-- Authenticated users can insert section_media
CREATE POLICY "Authenticated users can insert section_media"
    ON public.section_media
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update section_media
CREATE POLICY "Authenticated users can update section_media"
    ON public.section_media
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete section_media
CREATE POLICY "Authenticated users can delete section_media"
    ON public.section_media
    FOR DELETE
    USING (auth.role() = 'authenticated');
