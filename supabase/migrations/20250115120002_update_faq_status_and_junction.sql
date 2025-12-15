-- Update FAQ status from enum to TEXT with CHECK constraint and create junction table
-- Step 1: Drop RLS policy that depends on status column
DROP POLICY IF EXISTS "Public can view active faq_items" ON public.faq_items;

-- Step 2: Change status column from enum to TEXT
ALTER TABLE public.faq_items ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Step 3: Update existing data
UPDATE public.faq_items 
SET status = CASE 
    WHEN status = 'active' THEN 'published'
    WHEN status = 'inactive' THEN 'deactivated'
    ELSE 'draft'
END;

-- Step 4: Add CHECK constraint
ALTER TABLE public.faq_items 
ADD CONSTRAINT faq_items_status_check 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Step 5: Drop the old enum type if it exists
DROP TYPE IF EXISTS public.faq_status CASCADE;

-- Step 6: Recreate RLS policy with updated status values
CREATE POLICY "Public can view active faq_items"
    ON public.faq_items
    FOR SELECT
    USING (status = 'published');

-- Step 7: Create section_faq_items junction table
CREATE TABLE IF NOT EXISTS public.section_faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    faq_item_id UUID NOT NULL REFERENCES public.faq_items(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, faq_item_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_faq_items_section_id ON public.section_faq_items(section_id);
CREATE INDEX IF NOT EXISTS idx_section_faq_items_faq_item_id ON public.section_faq_items(faq_item_id);
CREATE INDEX IF NOT EXISTS idx_section_faq_items_position ON public.section_faq_items(section_id, position);

-- Enable RLS on section_faq_items table
ALTER TABLE public.section_faq_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for section_faq_items table
-- Public can view section_faq_items
CREATE POLICY "Public can view section_faq_items"
    ON public.section_faq_items
    FOR SELECT
    USING (true);

-- Authenticated users can insert section_faq_items
CREATE POLICY "Authenticated users can insert section_faq_items"
    ON public.section_faq_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update section_faq_items
CREATE POLICY "Authenticated users can update section_faq_items"
    ON public.section_faq_items
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete section_faq_items
CREATE POLICY "Authenticated users can delete section_faq_items"
    ON public.section_faq_items
    FOR DELETE
    USING (auth.role() = 'authenticated');
