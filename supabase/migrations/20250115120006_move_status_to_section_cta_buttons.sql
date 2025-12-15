-- Move status from cta_buttons to section_cta_buttons junction table
-- This allows each section to independently control CTA button visibility

-- Step 1: Add status column to section_cta_buttons table
ALTER TABLE public.section_cta_buttons 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Step 2: Migrate existing data from cta_buttons.status to section_cta_buttons.status
-- For each section_cta_buttons row, copy status from the related cta_buttons.status
UPDATE public.section_cta_buttons scb
SET status = CASE 
    WHEN cb.status = 'published' THEN 'published'
    WHEN cb.status = 'draft' THEN 'draft'
    WHEN cb.status = 'deactivated' THEN 'deactivated'
    ELSE 'draft'
END
FROM public.cta_buttons cb
WHERE scb.cta_button_id = cb.id;

-- Step 3: Create index on status for performance
CREATE INDEX IF NOT EXISTS idx_section_cta_buttons_status 
ON public.section_cta_buttons(section_id, status);

-- Step 4: Drop status column from cta_buttons table
-- First, drop any RLS policies that depend on cta_buttons.status
DROP POLICY IF EXISTS "Public can view active cta_buttons" ON public.cta_buttons;

-- Drop the CHECK constraint
ALTER TABLE public.cta_buttons DROP CONSTRAINT IF EXISTS cta_buttons_status_check;

-- Drop the index on status
DROP INDEX IF EXISTS public.idx_cta_buttons_status;
DROP INDEX IF EXISTS public.idx_cta_buttons_status_created;

-- Drop the status column
ALTER TABLE public.cta_buttons DROP COLUMN IF EXISTS status;

-- Step 5: Update RLS policy on section_cta_buttons to filter by status
-- Drop existing public view policy
DROP POLICY IF EXISTS "Public can view section_cta_buttons" ON public.section_cta_buttons;

-- Create new policy that filters by status (published in production, published+draft in development)
-- Note: Environment-based filtering will be handled in application code
CREATE POLICY "Public can view published section_cta_buttons"
    ON public.section_cta_buttons
    FOR SELECT
    USING (status = 'published');
