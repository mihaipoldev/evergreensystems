-- Add status to testimonials and create section_testimonials junction table
-- Step 1: Drop RLS policy that depends on approved column
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;

-- Step 2: Add status column with default 'draft'
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Step 3: Migrate approved boolean to status
-- approved = true -> published, approved = false -> draft
UPDATE public.testimonials 
SET status = CASE 
    WHEN approved = true THEN 'published'
    ELSE 'draft'
END;

-- Step 4: Drop the approved column
ALTER TABLE public.testimonials DROP COLUMN IF EXISTS approved;

-- Step 5: Recreate RLS policy with updated status column
CREATE POLICY "Public can view approved testimonials"
    ON public.testimonials
    FOR SELECT
    USING (status = 'published');

-- Step 6: Create index on status
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);

-- Step 7: Create section_testimonials junction table
CREATE TABLE IF NOT EXISTS public.section_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, testimonial_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_testimonials_section_id ON public.section_testimonials(section_id);
CREATE INDEX IF NOT EXISTS idx_section_testimonials_testimonial_id ON public.section_testimonials(testimonial_id);
CREATE INDEX IF NOT EXISTS idx_section_testimonials_position ON public.section_testimonials(section_id, position);

-- Enable RLS on section_testimonials table
ALTER TABLE public.section_testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for section_testimonials table
-- Public can view section_testimonials
CREATE POLICY "Public can view section_testimonials"
    ON public.section_testimonials
    FOR SELECT
    USING (true);

-- Authenticated users can insert section_testimonials
CREATE POLICY "Authenticated users can insert section_testimonials"
    ON public.section_testimonials
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update section_testimonials
CREATE POLICY "Authenticated users can update section_testimonials"
    ON public.section_testimonials
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete section_testimonials
CREATE POLICY "Authenticated users can delete section_testimonials"
    ON public.section_testimonials
    FOR DELETE
    USING (auth.role() = 'authenticated');
