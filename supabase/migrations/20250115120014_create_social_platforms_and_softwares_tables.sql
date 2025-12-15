-- Create social_platforms table
CREATE TABLE IF NOT EXISTS public.social_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    base_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create softwares table
CREATE TABLE IF NOT EXISTS public.softwares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    website_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create section_socials junction table
CREATE TABLE IF NOT EXISTS public.section_socials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES public.social_platforms(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'deactivated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, platform_id)
);

-- Create section_softwares junction table
CREATE TABLE IF NOT EXISTS public.section_softwares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    software_id UUID NOT NULL REFERENCES public.softwares(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL DEFAULT 0,
    icon_override TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'deactivated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, software_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_section_socials_section_id ON public.section_socials(section_id);
CREATE INDEX IF NOT EXISTS idx_section_socials_platform_id ON public.section_socials(platform_id);
CREATE INDEX IF NOT EXISTS idx_section_socials_order ON public.section_socials(section_id, "order");
CREATE INDEX IF NOT EXISTS idx_section_socials_status ON public.section_socials(section_id, status);

CREATE INDEX IF NOT EXISTS idx_section_softwares_section_id ON public.section_softwares(section_id);
CREATE INDEX IF NOT EXISTS idx_section_softwares_software_id ON public.section_softwares(software_id);
CREATE INDEX IF NOT EXISTS idx_section_softwares_order ON public.section_softwares(section_id, "order");
CREATE INDEX IF NOT EXISTS idx_section_softwares_status ON public.section_softwares(section_id, status);

CREATE INDEX IF NOT EXISTS idx_social_platforms_name ON public.social_platforms(name);
CREATE INDEX IF NOT EXISTS idx_softwares_slug ON public.softwares(slug);

-- Add trigger for updated_at on social_platforms table
CREATE TRIGGER update_social_platforms_updated_at
    BEFORE UPDATE ON public.social_platforms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on softwares table
CREATE TRIGGER update_softwares_updated_at
    BEFORE UPDATE ON public.softwares
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.softwares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_softwares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_platforms table
-- Public can SELECT (read)
CREATE POLICY "Public can view social_platforms"
    ON public.social_platforms
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert social_platforms"
    ON public.social_platforms
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update social_platforms"
    ON public.social_platforms
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete social_platforms"
    ON public.social_platforms
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- RLS Policies for softwares table
-- Public can SELECT (read)
CREATE POLICY "Public can view softwares"
    ON public.softwares
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert softwares"
    ON public.softwares
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update softwares"
    ON public.softwares
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete softwares"
    ON public.softwares
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- RLS Policies for section_socials table
-- Public can view published section_socials
CREATE POLICY "Public can view published section_socials"
    ON public.section_socials
    FOR SELECT
    USING (status = 'published');

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert section_socials"
    ON public.section_socials
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update section_socials"
    ON public.section_socials
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete section_socials"
    ON public.section_socials
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- RLS Policies for section_softwares table
-- Public can view published section_softwares
CREATE POLICY "Public can view published section_softwares"
    ON public.section_softwares
    FOR SELECT
    USING (status = 'published');

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert section_softwares"
    ON public.section_softwares
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update section_softwares"
    ON public.section_softwares
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete section_softwares"
    ON public.section_softwares
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
