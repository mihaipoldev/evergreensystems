-- Refactor database structure: make sections reusable and content independent
-- This migration transforms the strict hierarchy (Page → Section → Content) 
-- into a flexible structure with reusable sections and independent content types

-- Step 1: Create page_sections junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(page_id, section_id)
);

-- Create indexes for page_sections
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON public.page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_id ON public.page_sections(section_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_position ON public.page_sections(position);

-- Step 2: Migrate existing data from sections to page_sections
INSERT INTO public.page_sections (page_id, section_id, position, visible, created_at, updated_at)
SELECT page_id, id, position, visible, created_at, updated_at
FROM public.sections
WHERE page_id IS NOT NULL;

-- Step 3: Remove columns from sections table
ALTER TABLE public.sections DROP COLUMN IF EXISTS page_id;
ALTER TABLE public.sections DROP COLUMN IF EXISTS position;
ALTER TABLE public.sections DROP COLUMN IF EXISTS visible;

-- Drop indexes that are no longer needed
DROP INDEX IF EXISTS idx_sections_page_id;
DROP INDEX IF EXISTS idx_sections_position;
DROP INDEX IF EXISTS idx_sections_visible;

-- Step 4: Remove section_id from content tables
-- Drop foreign key constraints and columns
ALTER TABLE public.faq_items DROP CONSTRAINT IF EXISTS faq_items_section_id_fkey;
ALTER TABLE public.faq_items DROP COLUMN IF EXISTS section_id;

ALTER TABLE public.testimonials DROP CONSTRAINT IF EXISTS testimonials_section_id_fkey;
ALTER TABLE public.testimonials DROP COLUMN IF EXISTS section_id;

ALTER TABLE public.offer_features DROP CONSTRAINT IF EXISTS offer_features_section_id_fkey;
ALTER TABLE public.offer_features DROP COLUMN IF EXISTS section_id;

ALTER TABLE public.cta_buttons DROP CONSTRAINT IF EXISTS cta_buttons_section_id_fkey;
ALTER TABLE public.cta_buttons DROP COLUMN IF EXISTS section_id;

-- Drop indexes that are no longer needed
DROP INDEX IF EXISTS idx_faq_items_section_id;
DROP INDEX IF EXISTS idx_testimonials_section_id;
DROP INDEX IF EXISTS idx_offer_features_section_id;
DROP INDEX IF EXISTS idx_cta_buttons_section_id;

-- Step 5: Add trigger for page_sections updated_at
CREATE TRIGGER update_page_sections_updated_at
    BEFORE UPDATE ON public.page_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Step 6: Enable RLS on page_sections table
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_sections table
-- Public can view page_sections
CREATE POLICY "Public can view page_sections"
    ON public.page_sections
    FOR SELECT
    USING (true);

-- Authenticated users can insert page_sections
CREATE POLICY "Authenticated users can insert page_sections"
    ON public.page_sections
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update page_sections
CREATE POLICY "Authenticated users can update page_sections"
    ON public.page_sections
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete page_sections
CREATE POLICY "Authenticated users can delete page_sections"
    ON public.page_sections
    FOR DELETE
    USING (auth.role() = 'authenticated');
