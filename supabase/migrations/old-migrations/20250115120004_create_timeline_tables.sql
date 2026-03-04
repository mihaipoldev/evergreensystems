-- Create timeline table and section_timeline junction table
-- Step 1: Create timeline table
CREATE TABLE IF NOT EXISTS public.timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    badge TEXT,
    icon TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on position for ordering
CREATE INDEX IF NOT EXISTS idx_timeline_position ON public.timeline(position);

-- Add trigger for updated_at
CREATE TRIGGER update_timeline_updated_at
    BEFORE UPDATE ON public.timeline
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on timeline table
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timeline table
-- Public can view timeline items
CREATE POLICY "Public can view timeline"
    ON public.timeline
    FOR SELECT
    USING (true);

-- Authenticated users can insert timeline items
CREATE POLICY "Authenticated users can insert timeline"
    ON public.timeline
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update timeline items
CREATE POLICY "Authenticated users can update timeline"
    ON public.timeline
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete timeline items
CREATE POLICY "Authenticated users can delete timeline"
    ON public.timeline
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Step 2: Create section_timeline junction table
CREATE TABLE IF NOT EXISTS public.section_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    timeline_id UUID NOT NULL REFERENCES public.timeline(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, timeline_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_timeline_section_id ON public.section_timeline(section_id);
CREATE INDEX IF NOT EXISTS idx_section_timeline_timeline_id ON public.section_timeline(timeline_id);
CREATE INDEX IF NOT EXISTS idx_section_timeline_position ON public.section_timeline(section_id, position);

-- Enable RLS on section_timeline table
ALTER TABLE public.section_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for section_timeline table
-- Public can view section_timeline
CREATE POLICY "Public can view section_timeline"
    ON public.section_timeline
    FOR SELECT
    USING (true);

-- Authenticated users can insert section_timeline
CREATE POLICY "Authenticated users can insert section_timeline"
    ON public.section_timeline
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update section_timeline
CREATE POLICY "Authenticated users can update section_timeline"
    ON public.section_timeline
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete section_timeline
CREATE POLICY "Authenticated users can delete section_timeline"
    ON public.section_timeline
    FOR DELETE
    USING (auth.role() = 'authenticated');
