-- Create results table and section_results junction table
-- Step 1: Create results table
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content JSONB NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on position for ordering
CREATE INDEX IF NOT EXISTS idx_results_position ON public.results(position);

-- Add trigger for updated_at
CREATE TRIGGER update_results_updated_at
    BEFORE UPDATE ON public.results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on results table
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for results table
-- Public can view results
CREATE POLICY "Public can view results"
    ON public.results
    FOR SELECT
    USING (true);

-- Authenticated users can insert results
CREATE POLICY "Authenticated users can insert results"
    ON public.results
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update results
CREATE POLICY "Authenticated users can update results"
    ON public.results
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete results
CREATE POLICY "Authenticated users can delete results"
    ON public.results
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Step 2: Create section_results junction table
CREATE TABLE IF NOT EXISTS public.section_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    result_id UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, result_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_results_section_id ON public.section_results(section_id);
CREATE INDEX IF NOT EXISTS idx_section_results_result_id ON public.section_results(result_id);
CREATE INDEX IF NOT EXISTS idx_section_results_position ON public.section_results(section_id, position);

-- Enable RLS on section_results table
ALTER TABLE public.section_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for section_results table
-- Public can view section_results
CREATE POLICY "Public can view section_results"
    ON public.section_results
    FOR SELECT
    USING (true);

-- Authenticated users can insert section_results
CREATE POLICY "Authenticated users can insert section_results"
    ON public.section_results
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update section_results
CREATE POLICY "Authenticated users can update section_results"
    ON public.section_results
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete section_results
CREATE POLICY "Authenticated users can delete section_results"
    ON public.section_results
    FOR DELETE
    USING (auth.role() = 'authenticated');
