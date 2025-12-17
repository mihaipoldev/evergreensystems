-- Enable Row Level Security on website tables
ALTER TABLE public.website_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for website_colors table
-- Public can SELECT (read) website colors
CREATE POLICY "Public can view website colors"
    ON public.website_colors
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT website colors
CREATE POLICY "Authenticated users can insert website colors"
    ON public.website_colors
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can UPDATE website colors
CREATE POLICY "Authenticated users can update website colors"
    ON public.website_colors
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can DELETE website colors
CREATE POLICY "Authenticated users can delete website colors"
    ON public.website_colors
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- RLS Policies for website_settings table
-- Public can SELECT (read) website settings
CREATE POLICY "Public can view website settings"
    ON public.website_settings
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT website settings
CREATE POLICY "Authenticated users can insert website settings"
    ON public.website_settings
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can UPDATE website settings
CREATE POLICY "Authenticated users can update website settings"
    ON public.website_settings
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can DELETE website settings
CREATE POLICY "Authenticated users can delete website settings"
    ON public.website_settings
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
