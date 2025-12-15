-- Remove status filtering from junction table RLS policies
-- Status filtering will now be handled at the application level based on NODE_ENV
-- This allows draft items to be visible in development while keeping production secure

-- ============================================================================
-- 1. Update section_features RLS policy
-- ============================================================================

-- Drop existing policy that filters by status
DROP POLICY IF EXISTS "Public can view published section_features" ON public.section_features;
DROP POLICY IF EXISTS "Public can view section_features" ON public.section_features;

-- Create new policy that allows all (application will filter)
CREATE POLICY "Public can view section_features"
    ON public.section_features
    FOR SELECT
    USING (true);

-- ============================================================================
-- 2. Update section_faq_items RLS policy
-- ============================================================================

-- Drop existing policy that filters by status
DROP POLICY IF EXISTS "Public can view published section_faq_items" ON public.section_faq_items;
DROP POLICY IF EXISTS "Public can view section_faq_items" ON public.section_faq_items;

-- Create new policy that allows all (application will filter)
CREATE POLICY "Public can view section_faq_items"
    ON public.section_faq_items
    FOR SELECT
    USING (true);

-- ============================================================================
-- 3. Update section_cta_buttons RLS policy
-- ============================================================================

-- Drop existing policy that filters by status
DROP POLICY IF EXISTS "Public can view published section_cta_buttons" ON public.section_cta_buttons;
DROP POLICY IF EXISTS "Public can view section_cta_buttons" ON public.section_cta_buttons;

-- Create new policy that allows all (application will filter)
CREATE POLICY "Public can view section_cta_buttons"
    ON public.section_cta_buttons
    FOR SELECT
    USING (true);

-- ============================================================================
-- 4. Add status column to section_results (for consistency with other junction tables)
-- ============================================================================

-- Add status column with default 'draft'
ALTER TABLE public.section_results 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Set existing rows to 'published' status (they were visible before)
UPDATE public.section_results 
SET status = 'published'
WHERE status = 'draft' OR status IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_section_results_status 
ON public.section_results(section_id, status);
