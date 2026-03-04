-- Create section_cta_buttons junction table for many-to-many relationship
-- This allows sections to have multiple CTA buttons with custom ordering
CREATE TABLE IF NOT EXISTS public.section_cta_buttons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    cta_button_id UUID NOT NULL REFERENCES public.cta_buttons(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, cta_button_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_cta_buttons_section_id ON public.section_cta_buttons(section_id);
CREATE INDEX IF NOT EXISTS idx_section_cta_buttons_cta_button_id ON public.section_cta_buttons(cta_button_id);
CREATE INDEX IF NOT EXISTS idx_section_cta_buttons_position ON public.section_cta_buttons(section_id, position);

-- Enable RLS on section_cta_buttons table
ALTER TABLE public.section_cta_buttons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for section_cta_buttons table
-- Public can view section_cta_buttons
CREATE POLICY "Public can view section_cta_buttons"
    ON public.section_cta_buttons
    FOR SELECT
    USING (true);

-- Authenticated users can insert section_cta_buttons
CREATE POLICY "Authenticated users can insert section_cta_buttons"
    ON public.section_cta_buttons
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update section_cta_buttons
CREATE POLICY "Authenticated users can update section_cta_buttons"
    ON public.section_cta_buttons
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete section_cta_buttons
CREATE POLICY "Authenticated users can delete section_cta_buttons"
    ON public.section_cta_buttons
    FOR DELETE
    USING (auth.role() = 'authenticated');
