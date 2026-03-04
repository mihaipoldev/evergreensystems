-- Enable Row Level Security on all content tables
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages table
-- Public can SELECT (read)
CREATE POLICY "Public can view pages"
    ON public.pages
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert pages"
    ON public.pages
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update pages"
    ON public.pages
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete pages"
    ON public.pages
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for sections table
-- Public can SELECT (read)
CREATE POLICY "Public can view sections"
    ON public.sections
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert sections"
    ON public.sections
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sections"
    ON public.sections
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sections"
    ON public.sections
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for cta_buttons table
-- Public can SELECT (read)
CREATE POLICY "Public can view cta_buttons"
    ON public.cta_buttons
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert cta_buttons"
    ON public.cta_buttons
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cta_buttons"
    ON public.cta_buttons
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cta_buttons"
    ON public.cta_buttons
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for offer_features table
-- Public can SELECT (read)
CREATE POLICY "Public can view offer_features"
    ON public.offer_features
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert offer_features"
    ON public.offer_features
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update offer_features"
    ON public.offer_features
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete offer_features"
    ON public.offer_features
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for testimonials table
-- Public can SELECT (read) - only approved ones
CREATE POLICY "Public can view approved testimonials"
    ON public.testimonials
    FOR SELECT
    USING (approved = true);

-- Authenticated users can SELECT all (including unapproved)
CREATE POLICY "Authenticated users can view all testimonials"
    ON public.testimonials
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert testimonials"
    ON public.testimonials
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update testimonials"
    ON public.testimonials
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete testimonials"
    ON public.testimonials
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for faq_items table
-- Public can SELECT (read)
CREATE POLICY "Public can view faq_items"
    ON public.faq_items
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert faq_items"
    ON public.faq_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update faq_items"
    ON public.faq_items
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete faq_items"
    ON public.faq_items
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for media_assets table
-- Public can SELECT (read)
CREATE POLICY "Public can view media_assets"
    ON public.media_assets
    FOR SELECT
    USING (true);

-- Authenticated users can INSERT/UPDATE/DELETE
CREATE POLICY "Authenticated users can insert media_assets"
    ON public.media_assets
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update media_assets"
    ON public.media_assets
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete media_assets"
    ON public.media_assets
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- RLS Policies for analytics_events table
-- Public can INSERT (for tracking)
CREATE POLICY "Public can insert analytics_events"
    ON public.analytics_events
    FOR INSERT
    WITH CHECK (true);

-- Authenticated users can SELECT/UPDATE/DELETE
CREATE POLICY "Authenticated users can view analytics_events"
    ON public.analytics_events
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update analytics_events"
    ON public.analytics_events
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete analytics_events"
    ON public.analytics_events
    FOR DELETE
    USING (auth.role() = 'authenticated');
