-- Add status columns to section_features and section_faq_items junction tables
-- This allows each section to independently control feature and FAQ item visibility

-- Step 1: Add status column to section_features table
ALTER TABLE public.section_features 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Step 2: Migrate existing data - set all existing rows to 'published' since they were visible
UPDATE public.section_features 
SET status = 'published'
WHERE status IS NULL OR status = 'draft';

-- Step 3: Create index on status for performance
CREATE INDEX IF NOT EXISTS idx_section_features_status 
ON public.section_features(section_id, status);

-- Step 4: Add status column to section_faq_items table
ALTER TABLE public.section_faq_items 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Step 5: Migrate existing data - set all existing rows to 'published' since they were visible
UPDATE public.section_faq_items 
SET status = 'published'
WHERE status IS NULL OR status = 'draft';

-- Step 6: Create index on status for performance
CREATE INDEX IF NOT EXISTS idx_section_faq_items_status 
ON public.section_faq_items(section_id, status);

-- Step 7: Update RLS policies to filter by status
-- Drop existing public view policies
DROP POLICY IF EXISTS "Public can view section_features" ON public.section_features;
DROP POLICY IF EXISTS "Public can view section_faq_items" ON public.section_faq_items;

-- Create new policies that filter by status (published in production, published+draft in development)
-- Note: Environment-based filtering will be handled in application code
CREATE POLICY "Public can view published section_features"
    ON public.section_features
    FOR SELECT
    USING (status = 'published');

CREATE POLICY "Public can view published section_faq_items"
    ON public.section_faq_items
    FOR SELECT
    USING (status = 'published');
