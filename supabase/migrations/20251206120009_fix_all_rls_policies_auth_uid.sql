-- Fix all RLS policies across all tables to use auth.uid() instead of auth.role()
-- This ensures reliable authentication checks for all admin operations
-- auth.uid() IS NOT NULL is more reliable than auth.role() = 'authenticated'

-- ============================================================================
-- PAGES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated users can update pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated users can delete pages" ON public.pages;

CREATE POLICY "Authenticated users can insert pages"
    ON public.pages FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pages"
    ON public.pages FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pages"
    ON public.pages FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SECTIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can update sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can delete sections" ON public.sections;

CREATE POLICY "Authenticated users can insert sections"
    ON public.sections FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sections"
    ON public.sections FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete sections"
    ON public.sections FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- CTA_BUTTONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert cta_buttons" ON public.cta_buttons;
DROP POLICY IF EXISTS "Authenticated users can update cta_buttons" ON public.cta_buttons;
DROP POLICY IF EXISTS "Authenticated users can delete cta_buttons" ON public.cta_buttons;

CREATE POLICY "Authenticated users can insert cta_buttons"
    ON public.cta_buttons FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update cta_buttons"
    ON public.cta_buttons FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete cta_buttons"
    ON public.cta_buttons FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- OFFER_FEATURES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert offer_features" ON public.offer_features;
DROP POLICY IF EXISTS "Authenticated users can update offer_features" ON public.offer_features;
DROP POLICY IF EXISTS "Authenticated users can delete offer_features" ON public.offer_features;

CREATE POLICY "Authenticated users can insert offer_features"
    ON public.offer_features FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update offer_features"
    ON public.offer_features FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete offer_features"
    ON public.offer_features FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- FAQ_ITEMS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Authenticated users can update faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Authenticated users can delete faq_items" ON public.faq_items;

CREATE POLICY "Authenticated users can insert faq_items"
    ON public.faq_items FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update faq_items"
    ON public.faq_items FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete faq_items"
    ON public.faq_items FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- MEDIA_ASSETS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert media_assets" ON public.media_assets;
DROP POLICY IF EXISTS "Authenticated users can update media_assets" ON public.media_assets;
DROP POLICY IF EXISTS "Authenticated users can delete media_assets" ON public.media_assets;

CREATE POLICY "Authenticated users can insert media_assets"
    ON public.media_assets FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update media_assets"
    ON public.media_assets FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete media_assets"
    ON public.media_assets FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- ANALYTICS_EVENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can update analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can delete analytics_events" ON public.analytics_events;

CREATE POLICY "Authenticated users can view analytics_events"
    ON public.analytics_events FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update analytics_events"
    ON public.analytics_events FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete analytics_events"
    ON public.analytics_events FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PAGE_SECTIONS TABLE (junction table)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert page_sections" ON public.page_sections;
DROP POLICY IF EXISTS "Authenticated users can update page_sections" ON public.page_sections;
DROP POLICY IF EXISTS "Authenticated users can delete page_sections" ON public.page_sections;

CREATE POLICY "Authenticated users can insert page_sections"
    ON public.page_sections FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update page_sections"
    ON public.page_sections FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete page_sections"
    ON public.page_sections FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- MEDIA TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users can update media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON public.media;

CREATE POLICY "Authenticated users can insert media"
    ON public.media FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update media"
    ON public.media FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete media"
    ON public.media FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SECTION_MEDIA TABLE (junction table)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert section_media" ON public.section_media;
DROP POLICY IF EXISTS "Authenticated users can update section_media" ON public.section_media;
DROP POLICY IF EXISTS "Authenticated users can delete section_media" ON public.section_media;

CREATE POLICY "Authenticated users can insert section_media"
    ON public.section_media FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update section_media"
    ON public.section_media FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete section_media"
    ON public.section_media FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Note: Testimonials policies are already fixed in migration 20251206115810_fix_testimonials_rls_all_operations.sql
